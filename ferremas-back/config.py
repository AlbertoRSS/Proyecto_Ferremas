from flask import Flask
from dotenv import load_dotenv
import os

# Cargar variables de entorno
load_dotenv()

# Crear instancia de Flask
app = Flask(__name__, static_folder='static')

# Configuración de la base de datos
app.config['DB_HOST'] = os.getenv("DB_HOST")
app.config['DB_USER'] = os.getenv("DB_USER")
app.config['DB_PASSWORD'] = os.getenv("DB_PASSWORD")
app.config['DB_NAME'] = os.getenv("DB_NAME")
app.config['WEBPAY_INTEGRACION_TYPE'] = 'test'
app.config['WEBPAY_COMMERCE_CODE'] = '597055555532'
app.config['WEBPAY_API_KEY_SECRET'] = '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C'
app.config['WEBPAY_URL_RETURN'] = 'http://localhost:5000/webpay/retorno'
app.config['WEBPAY_URL_FINAL'] = 'http://localhost:5000/webpay/final'

# Configuración de la secret_key
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")

import pymysql
from config import app

def get_db_connection():
    connection = pymysql.connect(
        host=app.config['DB_HOST'],
        user=app.config['DB_USER'],
        password=app.config['DB_PASSWORD'],
        database=app.config['DB_NAME'],
        cursorclass=pymysql.cursors.DictCursor
    )
    return connection