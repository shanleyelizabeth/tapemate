
from flask import request
from flask_restful import Resource

from models import User, Session

from config import app, db, api





@app.route('/')
def index():
    return '<h1>What is up World?!</h1>'


if __name__ == '__main__':
    app.run(port=5555, debug=True)

