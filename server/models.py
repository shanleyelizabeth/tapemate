from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy

from config import db, bcrypt

class User(db.Model, SerializerMixin):
    __tablename__='users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False, unique=True)
    _password_hash= db.Column(db.String)
    location = db.Column(db.String) 
    profile_image = db.Column(db.String, default=None)
    is_available_as_reader = db.Column(db.Boolean, default=True)
    gender = db.Column(db.String, nullable=True)
    available_in_person = db.Column(db.Boolean, default = False)
    available_virtual = db.Column(db.Boolean, default = False)
    available_coaching = db.Column(db.Boolean, default=False)



    @property
    def password_hash(self):
        return self._password_hash

    @password_hash.setter
    def password_hash(self, new_password):
        plain_byte_obj = new_password.encode( 'utf-8')
        encrypted_hash_object = bcrypt.generate_password_hash(plain_byte_obj)
        hash_object_to_string = encrypted_hash_object.decode('utf-8')

        self._password_hash = hash_object_to_string

    def authenticate(self, password):
        return bcrypt.check_password_hash(self._password_hash, password.encode('utf-8'))

    actor_sessions = db.relationship('Session', cascade='all, delete-orphan', back_populates='actor', foreign_keys='Session.actor_id')
    reader_sessions = db.relationship('Session', cascade='all, delete-orphan', back_populates='reader', foreign_keys='Session.reader_id')

    actor_requests = db.relationship('Request', cascade='all, delete-orphan', back_populates='actor', foreign_keys='Request.actor_id')
    reader_requests = db.relationship('Request', cascade='all, delete-orphan', back_populates='reader', foreign_keys='Request.reader_id')

    availabilities = db.relationship('Availability', back_populates='user')

    def to_custom_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'location': self.location,
            'profile_image': self.profile_image,
            'is_available_as_reader': self.is_available_as_reader,
            'gender': self.gender,
            'available_in_person': self.available_in_person,
            'available_virtual': self.available_virtual,
            'available_coaching': self.available_coaching
    }


    def __repr__(self):
        return f'User {self.username}, ID {self.id}'
    
class Availability(db.Model, SerializerMixin):
    __tablename__ = 'availabilities'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    day_of_week = db.Column(db.String)
    start_time = db.Column(db.String)
    end_time = db.Column(db.String)

    user = db.relationship('User', back_populates='availabilities')

    def to_custom_dict(self):
        return {
            'id': self.id,
            'day_of_week': self.day_of_week,
            'start_time': self.start_time,
            'end_time': self.end_time,
    }

    def __repr__(self):
        return f"Availability(id={self.id}, user_id={self.user_id}, start_time={self.start_time}, end_time={self.end_time})"
    
class Request(db.Model, SerializerMixin):
    __tablename__ = 'requests'

    id = db.Column(db.Integer, primary_key=True)
    actor_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    reader_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    date = db.Column(db.Date, nullable= False)
    start_time=db.Column(db.Time, nullable=False)
    end_time=db.Column(db.Time, nullable = False)
    notes = db.Column(db.String)
    STATUS_OPEN = 'open'
    STATUS_ACCEPTED = 'accepted'
    STATUS_COMPLETED = 'completed'
    STATUS_CHOICES = [
        (STATUS_OPEN, 'Open'),
        (STATUS_ACCEPTED, 'Accepted'),
        (STATUS_COMPLETED, 'Completed')
    ]
    status = db.Column(db.String, default=STATUS_OPEN, nullable=False)
    session_type = db.Column(db.String, nullable=False)

    actor = db.relationship('User', back_populates='actor_requests', foreign_keys=actor_id)
    reader = db.relationship('User', back_populates='reader_requests', foreign_keys=reader_id)
    sessions = db.relationship('Session', backref='request')

    def to_custom_dict(self):
        return {
            'id': self.id,
            'actor_id': self.actor_id,
            'notes': self.notes,
            'date': self.date.strftime('%Y-%m-%d'),  
            'start_time': self.start_time.strftime('%H:%M:%S'),
            'end_time': self.end_time.strftime('%H:%M:%S'),
            'status': self.status,
            'session_type': self.session_type,
            'actor_username': self.actor.username if self.actor else None,
            'actor_profile_image': self.actor.profile_image if self.actor else None,
            'actor_location': self.actor.location if self.actor else None
        }


    @validates('session_type')
    def validate_session_type(self, key, session_type):
        valid_types = ['in-person', 'virtual', 'coaching']
        if session_type not in valid_types:
            raise ValueError(f"Invalid session type '{session_type}'. Must be one of {', '.join(valid_types)}.")
        return session_type
    
    @validates('notes')
    def validate_notes_length(self, key, notes):
        if notes and len(notes) > 500:  
            raise ValueError("Maximum 500 characters allowed.")
        return notes
    
class Session(db.Model, SerializerMixin):
    __tablename__ = 'sessions'

    id = db.Column(db.Integer, primary_key=True)
    request_id = db.Column(db.Integer, db.ForeignKey('requests.id'))
    actor_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    reader_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    date = db.Column(db.Date, nullable = False)
    start_time = db.Column(db.Time)
    end_time = db.Column(db.Time)
    notes = db.Column(db.String)
    session_type = db.Column(db.String)
    STATUS_SCHEDULED = 'scheduled'
    STATUS_COMPLETED = 'completed'
    STATUS_CHOICES = [
        (STATUS_SCHEDULED, 'Scheduled'),
        (STATUS_COMPLETED, 'Completed')
    ]
    status = db.Column(db.String, default=STATUS_SCHEDULED, nullable=False)

    @validates('status')
    def validate_status(self, key, status):
        valid_statuses = ['scheduled', 'completed']
        if status not in valid_statuses:
            raise ValueError(f"Invalid status '{status}'. Must be one of {', '.join(valid_statuses)}.")
        return status
    
    @validates('notes')
    def validate_notes_length(self, key, notes):
        if notes and len(notes) > 500:  
            raise ValueError("Maximum 500 characters allowed.")
        return notes

    actor = db.relationship('User', back_populates='actor_sessions', foreign_keys=actor_id)
    reader = db.relationship('User', back_populates='reader_sessions', foreign_keys=reader_id)

    def to_custom_dict(self):
        return {
            'id': self.id,
            'actor_id': self.actor_id,
            'reader_id': self.reader_id,
            'date': self.date.strftime('%Y-%m-%d'),
            'start_time': self.start_time.strftime('%H:%M:%S'),
            'end_time': self.end_time.strftime('%H:%M:%S'),
            'status': self.status,
            'notes': self.notes,
            'session_type': self.session_type,
            'actor': {
                'username': self.actor.username if self.actor else None,
                'profile_image': self.actor.profile_image if self.actor else None,
                'location': self.actor.location if self.actor else None
            },
            'reader': {
                'username': self.reader.username if self.reader else None,
                'profile_image': self.reader.profile_image if self.reader else None,
                'location': self.reader.location if self.reader else None
            }
        }

    def __repr__(self):
        return f'Session(ID: {self.id}, Actor ID: {self.actor_id}, Reader ID: {self.reader_id}, Status: {self.status})'
