from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    transaction_id = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    customer_id = db.Column(db.String(100), nullable=False)
    merchant = db.Column(db.String(200))
    transaction_date = db.Column(db.DateTime, nullable=False)
    category = db.Column(db.String(100))
    location = db.Column(db.String(100))
    
    # ML Results
    fraud_risk_score = db.Column(db.Float)  # 0.0 to 1.0
    risk_category = db.Column(db.String(20))  # 'low', 'medium', 'high'
    processed_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'transaction_id': self.transaction_id,
            'amount': self.amount,
            'customer_id': self.customer_id,
            'merchant': self.merchant,
            'transaction_date': self.transaction_date.isoformat(),
            'category': self.category,
            'location': self.location,
            'fraud_risk_score': self.fraud_risk_score,
            'risk_category': self.risk_category,
            'processed_at': self.processed_at.isoformat()
        }