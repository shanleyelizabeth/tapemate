
from flask import request
from flask_restful import Resource
from flask import request, make_response, session
from werkzeug.utils import secure_filename
import os

from models import User, Session, Request

from config import app, db, api


@app.route('/')
def index():
    return '<h1>What is up World?!</h1>'

@app.route('/login', methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(username = data["username"]).first()
    if not user:
        return make_response({"error": "User not found"}, 404)
    if user.authenticate(data["password"]):
        session["user_id"] = user.id
        print(session["user_id"])
        return make_response(user.to_dict(only=('username', 'id', 'profile_image'))), 201
    else:
        return make_response({"error": "Incorrect password"}, 400)

if __name__ == '__main__':
    app.run(port=5555, debug=True)

