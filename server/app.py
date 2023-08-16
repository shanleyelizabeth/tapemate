
from flask import request
from flask_restful import Resource
from flask import request, make_response, session
from datetime import datetime
from werkzeug.utils import secure_filename
import os

from models import User, Session, Request

from config import app, db, api, upload_folder, allowed_extensions

app.config['upload_folder'] = upload_folder

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

@app.route('/')
def index():
    return '<h1>What is up World?!</h1>'

class Requests(Resource):
    def get(self):
        requests = [r.to_dict() for r in Request.query.all()]
        return make_response( requests, 200)
    
    def post(self):
        data = request.get_json()
        
        actor_id = session.get("user_id", None)

        if not actor_id:
            return make_response({'error': 'Unauthorized user or Session expired'}, 401)

        session_type = data.get("session_type", None)

        if not session_type:
            return make_response({'error' : 'Session type is required'}, 400)
        
        date_time_str = data['date_time']
        date_time_obj = datetime.strptime(date_time_str, "%Y-%m-%dT%H:%M:%SZ")

        try:
            new_request = Request(
                actor_id=session['user_id'],
                notes=data.get('notes', None),
                date_time=date_time_obj,
                session_type=data['session_type']
            )
            db.session.add(new_request)
            db.session.commit()
            return make_response(new_request.to_dict(only=('actor_id', 'notes', 'date_time', 'session_type')), 201)
        except Exception as e:
            return make_response({"error" : str(e)}, 500)



class UserById(Resource):
    def delete(self,id):
        user = User.query.filter_by(id=id).first()
        if not user:
            return make_response({'error': 'User not found'}, 400)
        db.session.delete(user)
        db.session.commit()
        return make_response({'message':'Delete successful'}, 204)
    
    def patch(self, id):
        user = User.query.filter_by(id=id).first()
        if not user:
            return make_response({'error': 'User not found'}, 400)
            
        data=request.get_json()

        for attr in ['username', 'location']:
            if attr in data:
                setattr(user, attr, data[attr])

        if 'password' in data:
            user.password_hash = data['password']


        db.session.commit()
        return make_response(user.to_dict(only=('username', 'id', 'profile_image', 'location')), 200)

@app.route('/authorized', methods=["GET"])
def authorized():
    try:
        user = User.query.filter_by(id=session.get("user_id")).first()
        return make_response( user.to_dict(only=('username','id', 'profile_image')), 200)
    except:
        return make_response({"error": "Please log in or sign up"}, 401)

@app.route('/login', methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(username = data["username"]).first()
    if not user:
        return make_response({"error": "Username does not exist"}, 404)
    if user.authenticate(data["password"]):
        session["user_id"] = user.id
        print(session["user_id"])
        return make_response(user.to_dict(only=('username', 'id', 'profile_image'))), 201
    else:
        return make_response({"error": "Incorrect password"}, 400)
    
@app.route('/signup', methods = ["POST"])
def signup():
    username = request.form["username"]
    password = request.form["password"]
    
    if 'image' not in request.files:
        return make_response({"error": "No image uploaded"}, 400)
    
    image_file = request.files["image"]

    if image_file.filename == '':
        return make_response({"error": "No image uploaded"}, 400)
    if not allowed_file(image_file.filename):
        return make_response({"error":"Invalid file type"}, 400)
    
    filename = secure_filename(image_file.filename)
    image_path = os.path.join(app.config['upload_folder'], filename)
    image_file.save(image_path)

    try:
        new_user = User(
            username=username,
            password_hash=password,
            profile_image=f'http://localhost:5555/{image_path}'
        )
        db.session.add(new_user)
        db.session.commit()
        session["user_id"] = new_user.id
        return make_response(new_user.to_dict(only=("username", "id", "profile_image", "location")), 201)
    except ValueError as e:
        return make_response({"error": [e]}, 400)
    
api.add_resource(UserById,'/users/<int:id>')
api.add_resource(Requests, '/requests')

if __name__ == '__main__':
    app.run(port=5555, debug=True)

