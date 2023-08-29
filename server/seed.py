#!/usr/bin/env python3

from random import randint, choice as rc
from ast import literal_eval



import csv
from app import app
from models import db, User, Request, Session

filepath = 'users.csv'

def clear_database():
    with app.app_context():
        User.query.delete()
        db.session.commit()
    
def create_users(rows):
    with app.app_context():
        users=[]
        for i in range(1,len(rows)):
            user=User(
                username= rows[i][0],
                location=rows[i][2],
                profile_image=rows[i][3],
                is_available_as_reader=literal_eval(rows[i][4]),
                gender=rows[i][5],
                available_in_person=literal_eval(rows[i][6]),
                available_virtual=literal_eval(rows[i][7]),
                available_coaching=literal_eval(rows[i][8])
            )
            user.password_hash = rows[i][1]
            users.append(user)
        db.session.add_all(users)
        db.session.commit()
    return users







if __name__ == '__main__':

    with app.app_context():
        print("Clearing database...")
        clear_database()
        print("Creating users...")
        with open(filepath, newline='', encoding='utf-8') as csvfile:
            rows = [row for row in csv.reader(csvfile, delimiter=',', quotechar='"')]
            create_users(rows)
        print('Done seeding!')