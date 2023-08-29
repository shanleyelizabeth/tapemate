
from flask import request
from flask_restful import Resource
from flask import request, make_response, session
from datetime import datetime
from werkzeug.utils import secure_filename
import os

from models import User, Session, Request, Availability

from config import app, db, api, upload_folder, allowed_extensions

app.config['upload_folder'] = upload_folder

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def str_to_bool(s):
    return s.lower() == 'true'

@app.route('/')
def index():
    return '<h1>What is up World?!</h1>'

class Requests(Resource):
    def get(self):
        requests = [r.to_custom_dict() for r in Request.query.all()]
        return make_response( requests, 200)
    
    def post(self):

        data = request.get_json()
        
        actor_id = session.get("user_id", None)

        if not actor_id:
            return make_response({'error': 'Unauthorized user or Session expired'}, 401)

        session_type = data.get("session_type", None)

        if not session_type:
            return make_response({'error' : 'Session type is required'}, 400)
        
        date_str = data['date']
        start_time_str = data['start_time']
        end_time_str = data['end_time']

        date_obj = datetime.strptime(date_str, "%B %d, %Y").date()
        start_time_obj = datetime.strptime(start_time_str, "%H:%M").time()
        end_time_obj = datetime.strptime(end_time_str, "%H:%M").time()

        try:
            new_request = Request(
                actor_id=session['user_id'],
                notes=data.get('notes', None),
                date=date_obj,
                start_time=start_time_obj,
                end_time=end_time_obj,
                session_type=data['session_type']
            )
            db.session.add(new_request)
            db.session.commit()
            return make_response(new_request.to_dict(only=('actor_id', 'notes', 'date', 'start_time', 'end_time', 'session_type')), 201)
        except Exception as e:
            return make_response({"error" : str(e)}, 500)

class Sessions(Resource):
    def get(self):
        sessions = [s.to_custom_dict() for s in Session.query.all()]
        return make_response(sessions, 200)
    
    def post(self):
        data = request.get_json()

        date_str = data.get('date')
        start_time_str = data.get('start_time')
        end_time_str = data.get('end_time')
        

        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        start_time_obj = datetime.strptime(start_time_str, "%H:%M:%S").time()
        end_time_obj = datetime.strptime(end_time_str, "%H:%M:%S").time()


        try:
            request_id = data.get('request_id')
            request_to_update = Request.query.filter_by(id=request_id).first()
            if not request_to_update:
                return make_response({"error": "Request not found"})
            request_to_update.status = 'Accepted'

            new_session = Session(
                actor_id = data.get('actor_id'),
                reader_id = data.get('reader_id'),
                date = date_obj,
                start_time = start_time_obj,
                end_time = end_time_obj,
                session_type=data.get('session_type')
            )
            db.session.add(new_session)
            db.session.commit()
            return make_response(new_session.to_dict(only=('actor_id', 'reader_id', 'date', 'start_time', 'end_time', 'notes', 'session_type','status')))
        except Exception as e:
            db.session.rollback()
            return make_response({"error" : str(e)}, 500)

class SessionById(Resource):
    def patch(self, id):
        session = Session.query.filter_by(id=id).first()
        if not session:
            return make_response({'error': 'Session not found'}, 400 )

        data = request.get_json()

        if 'notes' in data:
            session.notes = data['notes']
        else:
            return make_response({'error': 'Missing notes in request'}, 400)
        db.session.add(session)
        db.session.commit()
        return make_response(session.to_dict(only=('notes',)), 200)

class Availabilities(Resource):
    def post(self):
        data = request.get_json()
        print(data)
        try:
            new_availability = Availability(
                user_id=data['user_id'],
                day_of_week=data['day_of_week'],
                start_time=data['start_time'],
                end_time=data['end_time']
            )
            db.session.add(new_availability)
            db.session.commit()
            print(new_availability.to_custom_dict())
            return make_response(new_availability.to_custom_dict())
        except Exception as e:
            return make_response({"error": {str(e)}}, 500)


class AvailabilityById(Resource):
    def delete(self, id):
        availability = Availability.query.filter_by(id=id).first()
        if not availability:
            return make_response({'error': 'User not found'}, 400)
        
        db.session.delete(availability)
        db.session.commit()
        return make_response({'message':'Delete successful'}, 204)

class UserById(Resource):
    def get(self, id):

        user = User.query.filter_by(id=id).first()
        if not user:
            return make_response({'error': 'User not found'}, 400)
        
        user_dict = user.to_custom_dict()
        
        user_dict['availabilities'] = [a.to_custom_dict() for a in user.availabilities]

        return make_response(user_dict, 200)
    
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
            
        

        for attr in ['username', 'location', 'gender']:
            if attr in request.form:
                setattr(user, attr, request.form[attr])

        if 'password' in request.form:
            user.password_hash = request.form['password']

        for session_type in ['available_in_person', 'available_virtual', 'available_coaching']:
            if session_type in request.form:
                value = str_to_bool(request.form[session_type])
                setattr(user, session_type, value)

        if 'is_available_as_reader' in request.form:
            is_available_as_reader_value = str_to_bool(request.form['is_available_as_reader'])  
            user.is_available_as_reader = is_available_as_reader_value

        if 'profile_image' in request.files:
            file = request.files['profile_image']
            if file:
                filename = secure_filename(file.filename)
                filepath = os.path.join(upload_folder, filename)
                file.save(filepath)
                user.profile_image = filepath

        db.session.commit()
        return make_response(user.to_dict(only=('username', 'id', 'profile_image', 'location', 'gender', 'is_available_as_reader', 'available_in_person', 'available_virtual', 'available_coaching')), 200)

@app.route('/authorized', methods=["GET"])
def authorized():
    try:
        user = User.query.filter_by(id=session.get("user_id")).first()
        return make_response( user.to_dict(only=('username','id', 'profile_image', 'location', 'gender')), 200)
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
        return make_response(user.to_dict(only=('username', 'id', 'profile_image', 'location', 'gender'))), 201
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
    
@app.route('/logout', methods=["DELETE"])
def logout():
    del session['user_id']
    return make_response({"message": "logout successful"}, 204)
    
api.add_resource(UserById,'/users/<int:id>')
api.add_resource(Requests, '/requests')
api.add_resource(Sessions, '/sessions')
api.add_resource(SessionById, '/sessions/<int:id>')
api.add_resource(Availabilities, '/availabilities')
api.add_resource(AvailabilityById, '/availabilities/<int:id>')

if __name__ == '__main__':
    app.run(port=5555, debug=True)

