import requests
import pandas as pd

def get_fraud_scores(transactions_data):
    """
    Send transaction data to ML service and get fraud scores
    """
    try:
        # Option 1: If ML model is a separate service
        ml_service_url = "http://localhost:5001/predict"  # ML specialist's service
        response = requests.post(ml_service_url, json=transactions_data)
        
        if response.status_code == 200:
            return response.json()['scored_transactions']
        else:
            # Fallback: Use simple rule-based scoring
            return _fallback_scoring(transactions_data)
            
    except Exception as e:
        print(f"ML service error: {e}, using fallback scoring")
        return _fallback_scoring(transactions_data)

def _fallback_scoring(transactions_data):
    """
    Simple rule-based scoring until ML model is ready
    """
    for transaction in transactions_data:
        amount = transaction.get('amount', 0)
        
        # Simple rules
        if amount > 1000:
            score = 0.8
        elif amount > 500:
            score = 0.5
        else:
            score = 0.1
            
        transaction['fraud_score'] = score
        
        # Categorize risk
        if score >= 0.7:
            transaction['risk_category'] = 'high'
        elif score >= 0.3:
            transaction['risk_category'] = 'medium'
        else:
            transaction['risk_category'] = 'low'
    
    return transactions_data