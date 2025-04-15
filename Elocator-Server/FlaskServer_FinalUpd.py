# -*- coding: utf-8 -*-
"""
Created on Sat Dec  7 22:44:34 2024

@author: user

pip install Flask==3.0.0 Flask-Cors==4.0.0 SQLAlchemy==2.0.22 Werkzeug==3.0.0 tensorflow==2.17.1 spacy==3.7.3 numpy==1.26.0

python -m spacy download en_core_web_sm

"""

import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np

from flask import Flask, request, jsonify , render_template
from flask_cors import CORS
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, LargeBinary, or_
from sqlalchemy.orm import declarative_base, sessionmaker ,scoped_session
from werkzeug.security import generate_password_hash, check_password_hash
import base64
import spacy
import logging
from sqlalchemy.exc import SQLAlchemyError
from contextlib import contextmanager
import json

app = Flask(__name__)
CORS(app)



# Load the trained model
MODEL_PATH = "waste_classifier_model.h5"
model = tf.keras.models.load_model(MODEL_PATH)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

import time

import os

nlp = spacy.load("en_core_web_sm")


# Waste categories
CATEGORIES = {
    0: "Electronic - Battery",
    1: "Electronic - Keyboard",
    2: "Electronic - Microwave",
    3: "Electronic - Mobile",
    4: "Electronic - Mouse",
    5: "Electronic - PCB",
    6: "Electronic - Player",
    7: "Electronic - Printer",
    8: "Electronic - Television",
    9: "Electronic - Washing Machine",
    10: "Non Electronic Waste"
}

CENTER = {
    0: "Battery Recycling Centre , Bangalore",
    1: "Keyboard Recycling Centre , Bangalore",
    2: "Microwave Recycling Centre , Bangalore",
    3: "Mobile Recycling Centre , Bangalore",
    4: "Mouse Recycling Centre , Bangalore",
    5: "PCB Recycling Centre , Bangalore",
    6: "Player Recycling Centre , Bangalore",
    7: "Printer Recycling Centre , Bangalore",
    8: "Television Recycling Centre , Bangalore",
    9: "Washing Machine Recycling Centre , Bangalore",
    10: "No Known Information"
    }

knowledge_base = [
    {"keywords": ["nearest", "e-waste", "disposal", "facility"], "answer": "Please provide your city or zip code, and I’ll locate the nearest facility for you."},
    {"keywords": ["dispose", "electronics", "safely"], "answer": "You can drop them off at a certified e-waste recycling center near you. Share your location, and I’ll help you find one."},
    {"keywords": ["pay", "e-waste", "recycling"], "answer": "Some facilities charge a small fee, while others offer free recycling. I can check for you."},
    {"keywords": ["e-waste"], "answer": "E-waste includes old electronics like phones, computers, TVs, batteries, and more."},
    {"keywords": ["recycle", "phone"], "answer": "Yes, many facilities accept phones for recycling. Let me help you locate one."},
    {"keywords": ["dispose", "old", "batteries"], "answer": "Provide your location, and I’ll find a facility that accepts batteries."},
    {"keywords": ["recycle", "broken", "headphones"], "answer": "Yes, headphones are considered e-waste. Let me locate a facility for you."},
    {"keywords": ["dispose", "old", "laptop"], "answer": "Most e-waste facilities accept laptops. Share your location to find the nearest one."},
    {"keywords": ["recycle", "light", "bulbs"], "answer": "Some facilities accept light bulbs. Let me check for options near you."},
    {"keywords": ["recycle", "printer", "cartridges"], "answer": "Many e-waste centers accept printer cartridges. I’ll help you locate one."},
    # Add more questions and keywords extracted from the document...
]


def find_answer(user_query):
    """Find the best matching answer using NLP and keyword matching."""
    # Tokenize and extract keywords from user query
    doc = nlp(user_query.lower())
    query_keywords = [token.text for token in doc if not token.is_stop and token.is_alpha]

    # Match the query keywords to the knowledge base
    best_match = None
    highest_score = 0
    for entry in knowledge_base:
        score = len(set(query_keywords) & set(entry["keywords"]))
        if score > highest_score:
            best_match = entry["answer"]
            highest_score = score

    return best_match or "I'm sorry, I couldn't find an answer to your question. Can you rephrase?"

def classify_waste(image_path):
    """
    Classify waste based on the input image.

    Args:
        image_path (str): Path to the input image.

    Returns:
        dict: A dictionary containing waste_type, recommended_center, and usable status.
    """
    try:
        # Load the image
        img = image.load_img(image_path, target_size=(224, 224))
        
        # Convert the image to an array
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
        img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)  # Preprocess for MobileNetV2
        
        # Make predictions
        predictions = model.predict(img_array)
        predicted_class = np.argmax(predictions, axis=1)[0]
        
        # Return the classification details
        #return predicted_class

        return CATEGORIES[predicted_class],CENTER[predicted_class]
    
    except Exception as e:
        print(e)
        return {"error": str(e)},0
    
# Database configuration
DATABASE_URL = "sqlite:///MyDB.db"
# engine = create_engine(DATABASE_URL, echo=False)
# Base = declarative_base()
# SessionLocal = sessionmaker(bind=engine)


engine = create_engine(DATABASE_URL, echo=True)
Base = declarative_base()
SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

# Product model
class Product(Base):
    __tablename__ = 'products'
    id = Column(Integer, primary_key=True, autoincrement=True)
    category = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    email = Column(String, nullable=False)
    contact = Column(String, nullable=False)
    location = Column(String, nullable=False)
    image_data_1 = Column(LargeBinary)
    image_data_2 = Column(LargeBinary)
    image_data_3 = Column(LargeBinary)

# User model
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(String, nullable=False)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone_number = Column(String, nullable=False)
    password = Column(String, nullable=False)
    creditPoints = Column(Integer, nullable=False)
    
    
# Feedback model
class Feedback(Base):
    __tablename__ = 'feedback'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    feedback = Column(String, nullable=False)
    
class Facility(Base):
    __tablename__ = 'facilities'
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    capacity = Column(Integer)
    lon = Column(Float)
    lat = Column(Float)
    contact = Column(String(20))
    time = Column(String(50))
    verified = Column(Boolean)
    address = Column(String(255))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "capacity": self.capacity,
            "lon": self.lon,
            "lat": self.lat,
            "contact": self.contact,
            "time": self.time,
            "verified": self.verified,
            "address": self.address
        }

# Route to get all facilities

@app.route('/api/facilities', methods=['GET'])
def get_facilities():
    try:
        with get_db_session() as session:  # Use the session from scoped_session
            facilities = session.query(Facility).all()

        # Convert facilities to a list of dictionaries
        facilities_list = [facility.to_dict() for facility in facilities]

        return jsonify(facilities_list), 200

    except Exception as e:
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500
    
class Booking(Base):
    __tablename__ = 'bookings'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False)
    user_email = Column(String(120), nullable=False)
    item_type = Column(String(100), nullable=False)
    recycle_item = Column(String(100), nullable=False)
    recycle_item_price = Column(Float, nullable=False)
    pickup_date = Column(String, nullable=False)
    pickup_time = Column(String, nullable=False)
    selected_facility = Column(String(200), nullable=False)
    full_name = Column(String(100), nullable=False)
    address = Column(String(200), nullable=False)
    phone = Column(String(20), nullable=False)  # Using String to accommodate various phone formats

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_email": self.user_email,
            "type": self.item_type,
            "recycle_item": self.recycle_item,
            "recycle_item_price": self.recycle_item_price,
            "pickup_date": self.pickup_date,
            "pickup_time": self.pickup_time,
            "selected_facility": self.selected_facility,
            "full_name": self.full_name,
            "address": self.address,
            "phone": self.phone
        }

Base.metadata.create_all(engine)

@app.route('/api/facility', methods=['POST'])
def add_booking():
    session = SessionLocal()
    try:
        data = request.get_json()
        logger.info(f"Received booking data: {data}")

        required_fields = [
            'userId',
            'userEmail',
            'type',
            'recycleItem',
            'recycleItemPrice',
            'pickupDate',
            'pickupTime',
            'facility',
            'fullName',
            'address',
            'phone'
        ]

        # Validate required fields
        missing_fields = [field for field in required_fields if field not in data or not str(data[field]).strip()]
        if missing_fields:
            error_message = f"Missing or empty fields: {', '.join(missing_fields)}"
            logger.error(error_message)
            return jsonify({"error": error_message}), 400

        # Create a new Booking instance
        try:
            new_booking = Booking(
                user_id=int(data['userId']),
                user_email=data['userEmail'].strip(),
                item_type = data['type'].strip(),
                recycle_item=data['recycleItem'].strip(),
                recycle_item_price=float(data['recycleItemPrice']),
                pickup_date=data['pickupDate'].strip(),
                pickup_time=data['pickupTime'].strip(),
                selected_facility=data['facility'].strip(),
                full_name=data['fullName'].strip(),
                address=data['address'].strip(),
                phone=str(data['phone']).strip()
            )
        except ValueError as ve:
            error_message = f"Invalid data type: {ve}"
            logger.error(error_message)
            return jsonify({"error": error_message}), 400

        session.add(new_booking)
        session.commit()

        response = {
            "message": "Booking added successfully",
            "id": new_booking.id
        }
        logger.info(f"Booking added with ID: {new_booking.id}")
        return jsonify(response), 201

    except Exception as e:
        session.rollback()
        logger.exception("An error occurred while adding booking")
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500
    finally:
        session.close()

@app.route('/showbookings', methods=['GET'])
def show_bookings():
    session = SessionLocal()
    try:
        page = request.args.get('page', default=1, type=int)
        limit = 10  # Number of bookings per page
        offset = (page - 1) * limit

        bookings = session.query(Booking).order_by(Booking.id.desc()).offset(offset).limit(limit).all()
        bookings_list = [booking.to_dict() for booking in bookings]

        total = session.query(Booking).count()
        total_pages = (total + limit - 1) // limit  # Ceiling division

        return render_template('bookings.html', bookings=bookings_list, page=page, total_pages=total_pages)
    except Exception as e:
        logger.exception("An error occurred while rendering bookings page")
        return "An error occurred while fetching bookings.", 500
    finally:
        session.close()
        
        
@app.route('/showfeedback')
def show_feedback():
    session = SessionLocal()
    feedback_list = session.query(Feedback).all()
    session.close()
    return render_template('feedback.html', feedback_list=feedback_list)

@app.route('/api/chatbot', methods=['POST'])
def handle_chatbot_message():
    try:
        data = request.json
        required_fields = ["user", "message"]
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"{field} is required"}), 400

        user_message = data["message"]
        
        if not user_message:
            return jsonify({"error": "Message is required"}), 400

        bot_reply = find_answer(user_message)
        # Example bot logic
        #bot_reply = f"You said: '{user_message}'. How can I assist you further?"

        return jsonify({"reply": bot_reply}), 200
    except Exception as e:
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500
    
# API to handle feedback submission and store in database
@app.route('/api/contact', methods=['POST'])
def store_feedback():
    try:
        data = request.json
        required_fields = ["name", "email", "phone", "feedback"]
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"{field} is required"}), 400

        session = SessionLocal()
        new_feedback = Feedback(
            name=data["name"],
            email=data["email"],
            phone=data["phone"],
            feedback=data["feedback"]
        )
        session.add(new_feedback)
        session.commit()
        session.close()

        return jsonify({"message": "Feedback stored successfully"}), 201
    except Exception as e:
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

@app.route('/api/image', methods=['POST'])
def image_get():
    
    file = request.files['file']
    # Save the file to the server
    file.save(f"Analyse_{file.filename}")
    #data = request.json
    #print(data)
    waste_type,recommended_center = classify_waste(f"Analyse_{file.filename}")
    
    if os.path.exists(f"Analyse_{file.filename}"):
        os.remove(f"Analyse_{file.filename}")
        print("File deleted successfully.")
    else:
        print("File does not exist.")
    #waste_type = "Plastic"
    #recommended_center = "Indiranagar"
    usable = True
    return jsonify({
        "wasteType": waste_type,
        "recommendedCenter": recommended_center,
        "usable": usable
    }), 200


# API to register a new user
@app.route('/api/auth/register', methods=['POST'])
def register_user():
    try:
        data = request.json
        required_fields = ["fullName", "username", "email", "phoneNumber", "password"]
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"{field} is required"}), 400

        session = SessionLocal()
        if session.query(User).filter(User.username == data["username"]).first():
            return jsonify({"error": "Username already exists"}), 400
        if session.query(User).filter(User.email == data["email"]).first():
            return jsonify({"error": "Email already exists"}), 400

        hashed_password = generate_password_hash(data["password"])
        new_user = User(
            full_name=data["fullName"],
            username=data["username"],
            email=data["email"],
            phone_number=data["phoneNumber"],
            creditPoints=data["creditPoints"],
            password=hashed_password
        )
        session.add(new_user)
        session.commit()
        session.close()

        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500
    

# API to sign in a user
@app.route('/api/auth/login', methods=['POST'])
def login_user():
    try:
        data = request.json
        required_fields = ["email", "password"]
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"{field} is required"}), 400

        session = SessionLocal()
        user = session.query(User).filter(User.email == data["email"]).first()

        if not user or not check_password_hash(user.password, data["password"]):
            return jsonify({"error": "Invalid email or password"}), 401

        session.close()

        return jsonify({
            "message": "Login successful",
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "fullname": user.full_name,
            "phoneNumber": user.phone_number,
            "creditPoints": user.creditPoints,
            "token": "dummy-token",  # Replace with actual token generation logic
        }), 200
    except Exception as e:
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

# API to get user credits by ID
@app.route('/api/get_credits/<int:id>', methods=['GET'])
def get_user_credits(id):
    try:
        session = SessionLocal()
        user = session.query(User).filter(User.id == id).first()

        if not user:
            session.close()
            return jsonify({"error": "User not found"}), 404

        session.close()

        return jsonify({
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "fullname": user.full_name,
            "phoneNumber": user.phone_number,
            "creditPoints": user.creditPoints
        }), 200
    except Exception as e:
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

# API to add credits to a user
@app.route('/api/add_credits/<int:id>', methods=['POST'])
def add_user_credits(id):
    session = None
    try:
        logger.info(f"Request to add credits to user {id}")
        data = request.json

        if not data or "add_credits" not in data or not str(data["add_credits"]).isdigit():
            logger.warning("Invalid add_credits input")
            return jsonify({"error": "add_credits is required and must be a positive integer"}), 400

        add_credits = int(data["add_credits"])
        session = SessionLocal()
        user = session.query(User).filter(User.id == id).first()

        if not user:
            logger.warning(f"User {id} not found")
            return jsonify({"error": "User not found"}), 404

        user.creditPoints += add_credits
        session.commit()
        logger.info(f"Credits updated successfully for user {id}")

        return jsonify({
            "message": "Credits updated successfully",
            "id": user.id,
            "creditPoints": user.creditPoints
        }), 200

    except Exception as e:
        logger.error(f"An error occurred: {str(e)}", exc_info=True)
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500
    finally:
        if session:
            session.close()

@app.route('/api/additem', methods=['POST'])
def add_item():
    try:
        required_fields = ['category', 'title', 'description', 'price', 'email', 'contact', 'location']
        for field in required_fields:
            if field not in request.form or not request.form[field].strip():
                return jsonify({"error": f"{field} is required"}), 400

        category = request.form['category'].strip()
        title = request.form['title'].strip()
        description = request.form['description'].strip()
        price = float(request.form['price'].strip())
        email = request.form['email'].strip()
        contact = request.form['contact'].strip()
        location = request.form['location'].strip()

        images = request.files.getlist('images')
        if len(images) == 0:
            return jsonify({"error": "Please upload at least one image"}), 400
        if len(images) > 3:
            return jsonify({"error": "Maximum 3 images allowed"}), 400

        image_data_list = [img.read() if img else None for img in images]
        while len(image_data_list) < 3:
            image_data_list.append(None)

        session = SessionLocal()
        product = Product(
            category=category,
            title=title,
            description=description,
            price=price,
            email=email,
            contact=contact,
            location=location,
            image_data_1=image_data_list[0],
            image_data_2=image_data_list[1],
            image_data_3=image_data_list[2]
        )
        session.add(product)
        session.commit()
        return jsonify({"message": "Product added successfully", "id": product.id}), 201
    except Exception as e:
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500
 
 # API to fetch all products with pagination and search
@app.route('/api/products', methods=['GET'])
def get_products():
     session = SessionLocal()
     try:
         search = request.args.get('search', '', type=str)
         page = request.args.get('page', 1, type=int)
         limit = request.args.get('limit', 10, type=int)

         query = session.query(Product)
         if search:
             search_term = f"%{search}%"
             query = query.filter(
                 or_(
                     Product.title.ilike(search_term),
                     Product.description.ilike(search_term),
                     Product.category.ilike(search_term),
                 )
             )

         total_count = query.count()
         products = query.offset((page - 1) * limit).limit(limit).all()

         results = []
         for product in products:
             images = [
                 f"data:image/jpeg;base64,{base64.b64encode(img).decode('utf-8')}" if img else None
                 for img in [product.image_data_1, product.image_data_2, product.image_data_3]
             ]
             results.append({
                 "id": product.id,
                 "category": product.category,
                 "title": product.title,
                 "description": product.description,
                 "price": product.price,
                 "location": product.location,
                 "images": images,
             })

         return jsonify({"products": results, "total": total_count, "page": page, "limit": limit}), 200
     except Exception as e:
         return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500
     finally:
         session.close()
    
# API to fetch a single product by ID
@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    session = SessionLocal()
    try:
        product = session.query(Product).filter(Product.id == product_id).first()
        if not product:
            return jsonify({"error": "Product not found"}), 404

        images = [
            f"data:image/jpeg;base64,{base64.b64encode(img).decode('utf-8')}" if img else None
            for img in [product.image_data_1, product.image_data_2, product.image_data_3]
        ]
        return jsonify({
            "id": product.id,
            "category": product.category,
            "title": product.title,
            "description": product.description,
            "price": product.price,
            "email": product.email,
            "contact": product.contact,
            "location": product.location,
            "images": images,
        }), 200
    except Exception as e:
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500
    finally:
        session.close()
        
 
        
@contextmanager
def get_db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
        
def load_data():
    try:
        # Ensure database is initialized
        #init_db()

        # Path to the facilities.json file
        basedir = os.path.abspath(os.path.dirname(__file__))
        facilities_file = os.path.join(basedir, 'facilities.json')

        if not os.path.exists(facilities_file):
            print("Error: facilities.json file not found.")
            return

        with open(facilities_file, 'r') as f:
            facilities_data = json.load(f)

        facilities = []
        for facility in facilities_data:
            # Create Facility object for each entry in the JSON
            facility_obj = Facility(
                id=facility.get("id"),
                name=facility.get("name"),
                capacity=facility.get("capacity"),
                lon=facility.get("lon"),
                lat=facility.get("lat"),
                contact=facility.get("contact"),
                time=facility.get("time"),
                verified=facility.get("verified"),
                address=facility.get("address")
            )
            facilities.append(facility_obj)

        # Save facilities to the database
        with get_db_session() as session:
            session.bulk_save_objects(facilities)
            session.commit()

        print(f"{len(facilities)} facilities loaded successfully into the database.")

    except SQLAlchemyError as e:
        print(f"An error occurred while loading data: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")
        

if __name__ == '__main__':
    #load_data()
    app.run(debug=False, host='0.0.0.0', port=5000)
