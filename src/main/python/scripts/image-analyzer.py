import sys
import json
import cv2
import numpy as np
import requests
from io import BytesIO
from PIL import Image

def download_image(image_url):
    try:
        response = requests.get(image_url)
        image = Image.open(BytesIO(response.content)).convert('RGB')
        return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    except Exception as e:
        raise ValueError(f"Failed to download or process image: {e}")

def detect_blur(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    return laplacian_var < 100  # threshold for blur detection

def detect_glare(image):
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    brightness = hsv[..., 2]
    overexposed_pixels = np.sum(brightness > 240)
    ratio = overexposed_pixels / (brightness.shape[0] * brightness.shape[1])
    return ratio > 0.05  # more than 5% of pixels are too bright

def detect_rotation(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    lines = cv2.HoughLines(edges, 1, np.pi / 180, 150)
    if lines is None:
        return False  # no lines detected
    angles = []
    for rho, theta in lines[:, 0]:
        angle = np.degrees(theta)
        if angle < 90:
            angles.append(angle)
    if not angles:
        return False
    avg_angle = np.mean(angles)
    return abs(avg_angle - 0) > 5  # more than 5° deviation from vertical

def detect_cutoff_edges(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    height, width = gray.shape
    top, bottom = gray[0:10, :], gray[-10:, :]
    left, right = gray[:, 0:10], gray[:, -10:]

    def is_edge_cut(part):
        return np.mean(part) < 20  # very dark: possibly cut off

    return any([
        is_edge_cut(top),
        is_edge_cut(bottom),
        is_edge_cut(left),
        is_edge_cut(right)
    ])

def analyze_image(image_url):
    image = download_image(image_url)
    issues = []

    if detect_blur(image):
        issues.append("Image is blurry")
    if detect_glare(image):
        issues.append("Glare detected")
    if detect_rotation(image):
        issues.append("Image may be rotated")
    if detect_cutoff_edges(image):
        issues.append("Some edges appear cut off")

    quality_score = 100 - len(issues) * 20  # Deduct 20 points per issue
    quality_score = max(quality_score, 0)

    return {
        "qualityScore": quality_score,
        "issues": issues or ["None"]
    }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        image_url = sys.argv[1]
        try:
            result = analyze_image(image_url)
            print(json.dumps(result))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
    else:
        print(json.dumps({"error": "No image URL provided"}))

