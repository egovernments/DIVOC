FROM python:3.9
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD [ "python3", "e2e_test.py" ]
