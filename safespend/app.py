from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from models import db, Transaction
from ml_integration import get_fraud_scores
from export_utils import generate_csv_report, generate_pdf_report
import pandas as pd
import os
from datetime import datetime

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///transactions.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'static/uploads'

db.init_app(app)

# Create tables
with app.app_context():
    db.create_all()

# Serve the main frontend
@app.route('/')
def serve_frontend():
    return send_from_directory('.', 'index.html')

# Serve static files (CSS, JS)
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

# --- API Endpoints ---

# 1. CSV Upload and Processing
@app.route('/api/upload', methods=['POST'])
def upload_csv():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    try:
        # Read CSV file
        df = pd.read_csv(file)
        
        # Convert to list of dictionaries for ML processing
        transactions_data = df.to_dict('records')
        
        # Get fraud scores from ML model
        scored_transactions = get_fraud_scores(transactions_data)
        
        # Save to database
        saved_count = 0
        for transaction_data in scored_transactions:
            transaction = Transaction(
                transaction_id=transaction_data['transaction_id'],
                amount=transaction_data['amount'],
                customer_id=transaction_data['customer_id'],
                merchant=transaction_data.get('merchant', ''),
                transaction_date=datetime.strptime(transaction_data['date'], '%Y-%m-%d'),
                category=transaction_data.get('category', ''),
                location=transaction_data.get('location', ''),
                fraud_risk_score=transaction_data['fraud_score'],
                risk_category=transaction_data['risk_category']
            )
            db.session.add(transaction)
            saved_count += 1
        
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully processed {saved_count} transactions',
            'total_transactions': saved_count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# 2. Get All Transactions
@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        transactions = Transaction.query.paginate(
            page=page, 
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            'transactions': [t.to_dict() for t in transactions.items],
            'total': transactions.total,
            'pages': transactions.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 3. Get Transaction by ID
@app.route('/api/transactions/<int:transaction_id>', methods=['GET'])
def get_transaction(transaction_id):
    transaction = Transaction.query.get_or_404(transaction_id)
    return jsonify(transaction.to_dict()), 200

# 4. Get Summary Data for Visualizations
@app.route('/api/transactions/summary', methods=['GET'])
def get_summary():
    try:
        print("📊 Generating summary data...")
        
        # Get all transactions
        transactions = Transaction.query.all()
        total_transactions = len(transactions)
        
        print(f"Total transactions: {total_transactions}")
        
        # Initialize risk distribution
        risk_distribution = {'high': 0, 'medium': 0, 'low': 0}
        
        # Calculate amount by category and risk distribution
        amount_by_category = {}
        
        for transaction in transactions:
            # Count risk categories
            risk_category = transaction.risk_category or 'low'
            if risk_category in risk_distribution:
                risk_distribution[risk_category] += 1
            else:
                risk_distribution[risk_category] = 1
            
            # Sum amounts by category
            category = transaction.category or 'Uncategorized'
            amount = transaction.amount or 0
            if category in amount_by_category:
                amount_by_category[category] += amount
            else:
                amount_by_category[category] = amount
        
        # High-risk count
        high_risk_count = risk_distribution.get('high', 0)
        
        summary_data = {
            'risk_distribution': risk_distribution,
            'amount_by_category': amount_by_category,
            'high_risk_count': high_risk_count,
            'total_transactions': total_transactions
        }
        
        print(f"📊 Summary data: {summary_data}")
        
        return jsonify(summary_data), 200
        
    except Exception as e:
        print(f"❌ Summary endpoint error: {e}")
        # Return default data structure
        return jsonify({
            'risk_distribution': {'high': 0, 'medium': 0, 'low': 0},
            'amount_by_category': {},
            'high_risk_count': 0,
            'total_transactions': 0
        }), 200
    
# 5. Clearing the transaction
@app.route('/api/clear', methods=['POST'])
def clear_transactions():
    try:
        # Count before clearing
        count_before = Transaction.query.count()
        
        # Clear all transactions
        Transaction.query.delete()
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully cleared {count_before} transactions',
            'cleared_count': count_before
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 

# 6. Export Endpoints
@app.route('/api/export/csv', methods=['GET'])
def export_csv():
    try:
        transactions = Transaction.query.all()
        filename = generate_csv_report(transactions)
        return send_file(filename, as_attachment=True, download_name='fraud_report.csv')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/export/pdf', methods=['GET'])
def export_pdf():
    try:
        transactions = Transaction.query.all()
        filename = generate_pdf_report(transactions)
        return send_file(filename, as_attachment=True, download_name='fraud_report.pdf')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 7. Test endpoint
@app.route('/api/test', methods=['GET'])
def test_api():
    return jsonify({
        'message': 'Backend is working!',
        'status': 'success',
        'timestamp': datetime.now().isoformat()
    }), 200

if __name__ == '__main__':
    # Create necessary directories
    os.makedirs('exports', exist_ok=True)
    os.makedirs('static/uploads', exist_ok=True)
    

    app.run(debug=True, port=5000)
