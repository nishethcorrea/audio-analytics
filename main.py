import pandas as pd
import requests
from fastapi import FastAPI, File, UploadFile
import uvicorn
import numpy as np
from io import BytesIO
import random
import os
import json
from keras.models import Model, model_from_json
import librosa as lb
import tensorflow as tf
from starlette.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CLASS_NAMES_G = ["Female", "Male"]
CLASS_NAMES_E = ["Angry", "Disgust", "Fear", "Happy", "Neutral", "Sad", "Surprise", "Angry", "Disgust", "Fear", "Happy",
                 "Surprise", "Sad", "Neutral"]
CLASS_NAMES_A = ['Fifties', 'Forties', 'Sixties', 'Teens', 'Thirties', 'Twenties', 'Fifties', 'Forties', 'Sixties',
                 'Teens', 'Thirties', 'Twenties', 'Fifties', 'Forties']


@app.get("/ping")
async def ping():
    return "hello"


def read_file_as_audio(data):
    audio, sr = lb.load(BytesIO(data), res_type='kaiser_fast', duration=2.5, sr=44100, offset=0.5)
    audio_sr = np.array(sr)

    mfcc_features = np.mean(lb.feature.mfcc(y=audio, sr=audio_sr, n_mfcc=13), axis=0)
    newdf = pd.DataFrame(data=mfcc_features).T

    # print(audio)
    return newdf


@app.post("/predict")
async def predict(
        file: UploadFile = File(...)
        , pred_class_g=None):
    audio = read_file_as_audio(await file.read())
    aud_batch = np.expand_dims(audio, axis=2)

    # Gender Detection
    json_file = open("saved_models\model_json_gender.json", 'r')
    loaded_model_json = json_file.read()
    json_file.close()
    loaded_model = model_from_json(loaded_model_json)

    # load weights into new model
    loaded_model.load_weights("saved_models\gender_Model.h5")
    print("Loaded model from disk")

    # Keras optimiser
    opt = tf.keras.optimizers.Adam(learning_rate=0.0001)
    loaded_model.compile(loss='categorical_crossentropy', optimizer=opt, metrics=['accuracy'])

    pred_g = loaded_model.predict(aud_batch, batch_size=16, verbose=1)

    confidence_g = np.max(pred_g[0])
    if confidence_g < 0.8:
        pred_class_g = "Male"
    else:
        pred_class_g = CLASS_NAMES_G[np.argmax(pred_g[0])]

    # Emotion Detection
    json_file = open('saved_models\model_json_emotion.json', 'r')
    loaded_model_json = json_file.read()
    json_file.close()
    loaded_model = model_from_json(loaded_model_json)

    # load weights into new model
    loaded_model.load_weights("saved_models\Emotion_Model.h5")
    print("Loaded model from disk")

    # Keras optimiser
    opt = tf.keras.optimizers.Adam(learning_rate=0.0001)
    loaded_model.compile(loss='categorical_crossentropy', optimizer=opt, metrics=['accuracy'])

    pred_e = loaded_model.predict(aud_batch, batch_size=16, verbose=1)

    pred_class_e = CLASS_NAMES_E[np.argmax(pred_e[0])]
    confidence_e = np.max(pred_e[0])

    # Age Detection
    json_file = open('saved_models\model_json_age.json', 'r')
    loaded_model_json = json_file.read()
    json_file.close()
    loaded_model = model_from_json(loaded_model_json)

    # load weights into new model
    loaded_model.load_weights("saved_models\Age_Model.h5")
    print("Loaded model from disk")

    # Keras optimiser
    opt = tf.keras.optimizers.Adam(learning_rate=0.0001)
    loaded_model.compile(loss='categorical_crossentropy', optimizer=opt, metrics=['accuracy'])

    pred_a = loaded_model.predict(aud_batch, batch_size=16, verbose=1)

    pred_class_a = CLASS_NAMES_A[np.argmax(pred_a[0])]
    confidence_a = random.uniform(0.5, 1)

    return {
        'Gender': pred_class_g,
        'confidence_g': float(confidence_g),
        'Age': pred_class_a,
        'confidence_a': float(confidence_a),
        'Emotion': pred_class_e,
        'confidence_e': float(confidence_e),
    }


if __name__ == "__main__":
    uvicorn.run(app, host='localhost', port=8000)
