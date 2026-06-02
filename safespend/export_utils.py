import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
import os
from datetime import datetime

def generate_csv_report(transactions):
    """Generate CSV export"""
    data = [t.to_dict() for t in transactions]
    df = pd.DataFrame(data)
    
    filename = f"exports/fraud_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    os.makedirs('exports', exist_ok=True)
    
    df.to_csv(filename, index=False)
    return filename

def generate_pdf_report(transactions):
    """Generate PDF export"""
    filename = f"exports/fraud_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    os.makedirs('exports', exist_ok=True)
    
    doc = SimpleDocTemplate(filename, pagesize=letter)
    elements = []
    
    # Title
    styles = getSampleStyleSheet()
    elements.append(Paragraph("Fraud Risk Report", styles['Title']))
    
    # Prepare data for table
    data = [['ID', 'Amount', 'Customer', 'Risk Score', 'Category']]
    for t in transactions[:50]:  # Limit for PDF
        data.append([
            t.transaction_id,
            f"${t.amount:.2f}",
            t.customer_id,
            f"{t.fraud_risk_score:.2f}",
            t.risk_category
        ])
    
    # Create table
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 14),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(table)
    doc.build(elements)
    return filename