# 🛡️ SafeSpend – Fraud Risk Dashboard

SafeSpend is a full-stack Fraud Risk Dashboard designed to monitor financial transactions, identify suspicious activity, and visualize fraud-related insights through an interactive dashboard interface.

The project helps users analyze transaction data efficiently using fraud risk scoring, analytics charts, and exportable reports in PDF and CSV formats.

---

# 📌 Features

* 📊 Interactive Fraud Risk Dashboard
* 🔍 Fraud Risk Classification (Low / Medium / High)
* 📈 Real-time Charts & Analytics using Chart.js
* 📁 CSV Transaction Upload Support
* 📄 Export Reports in PDF and CSV
* 🗃️ SQLite Database Integration
* 🔗 REST API Communication using Flask
* 🎨 Clean and Responsive UI

---

# 🧠 Project Objective

The goal of SafeSpend is to simplify fraud monitoring and transaction analysis by providing:

* Transaction management and monitoring
* Fraud risk detection logic
* Visual analytics and insights
* Exportable audit-ready reports
* A user-friendly dashboard for decision-making

---

# 🏗️ System Architecture

SafeSpend follows a client-server architecture.

## Frontend

* HTML
* CSS
* JavaScript
* Chart.js

## Backend

* Python
* Flask
* REST APIs

## Database

* SQLite

## Reports

* PDF Export
* CSV Export

---

# ⚙️ Workflow

1. Transaction CSV data is uploaded
2. Data is stored in SQLite database
3. Backend APIs process transaction records
4. Fraud scoring logic evaluates risk levels
5. Dashboard displays analytics and charts
6. Reports can be exported as PDF or CSV

---

# 📂 Project Structure

```bash
SafeSpend/
│
├── frontend/
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── chart.js
│
├── backend/
│   ├── app.py
│   ├── models.py
│   ├── ml_integration.py
│   └── export_utils.py
│
├── instance/
│   └── transactions.db
│
├── exports/
│   ├── report.csv
│   └── report.pdf
│
└── README.md
```

---

# 🚀 Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/ajaya-bk/Fraud-Risk-Dashboard.git
cd Fraud-Risk-Dashboard
```

---

## 2️⃣ Create Virtual Environment

```bash
python -m venv venv
```

### Activate Environment

#### Windows

```bash
venv\Scripts\activate
```

#### Mac/Linux

```bash
source venv/bin/activate
```

---

## 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 4️⃣ Run the Flask Backend

```bash
python app.py
```

Backend will start on:

```bash
http://127.0.0.1:5000
```

---

## 5️⃣ Open Frontend

Open `index.html` in your browser.

---

# 📊 Dashboard Features

## ✅ Transaction Management

* View transaction records
* Upload CSV transaction data
* Clear/reset transaction history

## ✅ Fraud Risk Detection

Transactions are categorized into:

* 🟢 Low Risk
* 🟡 Medium Risk
* 🔴 High Risk

## ✅ Analytics & Visualization

* Fraud distribution charts
* Risk category breakdown
* Transaction insights

## ✅ Report Export

* Export reports as PDF
* Export reports as CSV

---

# 🖼️ Screenshots

## Dashboard Interface

*Add your screenshots here*

```bash
/screenshots/dashboard.png
/screenshots/charts.png
/screenshots/table.png
```

---

# 👨‍💻 Team Contributions

## Jayant Gautam – Frontend Developer

* Designed and developed dashboard UI
* Implemented dynamic frontend functionality
* Integrated Chart.js for analytics
* Connected frontend with backend APIs
* Added export, upload, and clear actions

## Ajaya BK – Backend Developer

* Developed Flask backend APIs
* Integrated SQLite database
* Implemented fraud risk scoring logic
* Built PDF and CSV export functionality

## Nixon Antony – Tester

* Performed functional and API testing
* Tested dashboard usability and edge cases
* Verified export reports and bug fixes

---

# 🧪 Technologies Used

| Category | Technologies                    |
| -------- | ------------------------------- |
| Frontend | HTML, CSS, JavaScript, Chart.js |
| Backend  | Python, Flask                   |
| Database | SQLite                          |
| Reports  | PDF Export, CSV Export          |

---

# 📈 Results

SafeSpend successfully:

* Displays transaction records dynamically
* Detects fraud risk levels
* Visualizes fraud insights using charts
* Generates downloadable reports
* Improves fraud analysis efficiency

---

# 🎯 Future Improvements

* AI/ML-based fraud prediction model
* User authentication system
* Real-time notifications
* Advanced analytics dashboard
* Cloud database integration

---

# 📚 What We Learned

This project helped the team gain practical experience in:

* Full-stack development
* API integration
* Fraud risk analysis
* Dashboard visualization
* Database management
* Report generation
* Testing and debugging


---

# 📄 License

This project was developed for academic and learning purposes at Macromedia University of Applied Sciences.

---

# ⭐ Acknowledgements

Special thanks to:

* Prof. Aykut Bußian
* Ahmet Yildiz
* Macromedia University of Applied Sciences

for their guidance and support throughout the project.
