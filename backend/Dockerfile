FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy data files from the correct path
COPY data/company_data.parquet /app/data/company_data.parquet
COPY data/target_company_data.parquet /app/data/target_company_data.parquet

COPY . .

EXPOSE 5000

CMD ["python", "main.py"]