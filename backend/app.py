import os
from flask import Flask, send_file, request, jsonify
from flask_cors import CORS
from pptx import Presentation
from pptx.util import Pt, Inches
from pptx.dml.color import RGBColor
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE
import google.generativeai as genai
import re
import requests
from io import BytesIO
import base64
import pandas as pd

# Initialize Flask app and enable CORS
app = Flask(__name__)
CORS(app)

# Configure Gemini API
genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))

# Define theme options
THEMES = {
    "professional": {
        "background": RGBColor(230, 242, 255),
        "title_color": RGBColor(0, 102, 204),
        "text_color": RGBColor(51, 51, 51),
        "font_name": "Calibri",
    },
    "modern": {
        "background": RGBColor(245, 245, 245),
        "title_color": RGBColor(33, 150, 243),
        "text_color": RGBColor(66, 66, 66),
        "font_name": "Helvetica",
    }
}

# Chart type mapping
CHART_TYPES = {
    "bar": XL_CHART_TYPE.COLUMN_CLUSTERED,
    "line": XL_CHART_TYPE.LINE,
    "pie": XL_CHART_TYPE.PIE,
    "scatter": XL_CHART_TYPE.XY_SCATTER,
}

# Presentation styling constants
TITLE_FONT_SIZE = Pt(32)
CONTENT_FONT_SIZE = Pt(18)

# Process titles from API response
def process_titles(text):
    lines = text.strip().split('\n')
    titles = [line.strip() for line in lines if line.strip()]
    return titles[:3]

# Process bullet points to ensure consistent formatting
def process_bullet_points(text):
    lines = text.split('\n')
    cleaned_lines = []
    for line in lines:
        line = line.strip()
        if line:
            # Remove any leading numbers or bullets
            line = re.sub(r'^[\d\.\-\*\s]+', '', line)
            cleaned_lines.append('- ' + line)
    return '\n'.join(cleaned_lines)

# Generate slide titles using the Gemini API
def generate_slide_titles(content, language="en"):
    prompt = f"Generate exactly 3 concise slide titles for a presentation on '{content}' in {language}, no preamble or numbering."
    response = genai.generate_text(
        model="gemini-2.0-flash",
        prompt=prompt,
        max_output_tokens=100,
        temperature=0.7
    )
    titles_text = response.text.strip()
    titles = process_titles(titles_text)
    while len(titles) < 3:
        titles.append(f"{content} Overview {len(titles) + 1}")
    return titles[:3]

# Generate slide content using the Gemini API
def generate_slide_content(slide_title, has_image=True, summarize=False, language="en"):
    if summarize:
        prompt = f"Summarize content for '{slide_title}' into two concise paragraphs (max 30 words each) in {language}, no preamble or labels."
        max_tokens = 100
    elif has_image:
        prompt = f"Generate two concise paragraphs (max 50 words each) for '{slide_title}' in {language}, no preamble or labels like 'Option 1:'."
        max_tokens = 150
    else:
        prompt = f"Generate six concise bullet points (max 25 words each) for '{slide_title}' in {language}. Use '-' as bullet marker, no numbering or labels like 'point 1'."
        max_tokens = 300
    response = genai.generate_text(
        model="gemini-2.0-flash",
        prompt=prompt,
        max_output_tokens=max_tokens,
        temperature=0.7
    )
    content = response.text.strip()
    if not has_image and not summarize:
        content = process_bullet_points(content)
    return content

# Generate image using Stable Diffusion API
def generate_image(prompt, language="en"):
    api_url = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"
    api_key = os.environ.get('STABILITY_API_KEY')
    if not api_key:
        print("STABILITY_API_KEY not set")
        return None
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    data = {
        "text_prompts": [{"text": f"{prompt}, professional high-quality illustration, styled for {language} audience"}],
        "cfg_scale": 7,
        "height": 1024,
        "width": 1024,
        "samples": 1,
        "steps": 30,
    }
    try:
        response = requests.post(api_url, headers=headers, json=data)
        if response.status_code == 200:
            image_data = response.json()["artifacts"][0]["base64"]
            return BytesIO(base64.b64decode(image_data))
        else:
            print(f"Image generation failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Error generating image: {e}")
        return None

# Generate chart from CSV data
def generate_chart(slide, csv_file, chart_type="bar"):
    try:
        df = pd.read_csv(csv_file)
        chart_data = CategoryChartData()
        chart_data.categories = df.iloc[:, 0].tolist()
        chart_data.add_series('Data', df.iloc[:, 1].tolist())
        chart_type_enum = CHART_TYPES.get(chart_type, XL_CHART_TYPE.COLUMN_CLUSTERED)
        slide.shapes.add_chart(
            chart_type_enum,
            Inches(2), Inches(2),
            Inches(6), Inches(4),
            chart_data
        )
    except Exception as e:
        print(f"Error generating chart: {e}")

# Create the PowerPoint presentation
def create_presentation(topic, text_file, csv_file, theme="professional", language="en", include_images=True, summarize=False, chart_type="bar"):
    prs = Presentation()
    selected_theme = THEMES.get(theme, THEMES["professional"])

    # Determine content source
    content = topic
    if text_file:
        content = text_file.read().decode('utf-8')

    # Title slide
    title_slide = prs.slides.add_slide(prs.slide_layouts[0])
    title_slide.shapes.title.text = content.split('\n')[0]
    title_slide.shapes.title.text_frame.paragraphs[0].font.size = TITLE_FONT_SIZE
    title_slide.shapes.title.text_frame.paragraphs[0].font.name = selected_theme["font_name"]
    title_slide.shapes.title.text_frame.paragraphs[0].font.color.rgb = selected_theme["title_color"]
    if len(title_slide.placeholders) > 1:
        title_slide.placeholders[1].text = "Powered by AI"
        title_slide.placeholders[1].text_frame.paragraphs[0].font.size = Pt(24)
        title_slide.placeholders[1].text_frame.paragraphs[0].font.color.rgb = selected_theme["text_color"]
    title_slide.background.fill.solid()
    title_slide.background.fill.fore_color.rgb = selected_theme["background"]

    # Generate content slides
    slide_titles = generate_slide_titles(content, language)
    for i, title in enumerate(slide_titles):
        slide = prs.slides.add_slide(prs.slide_layouts[5])
        slide.background.fill.solid()
        slide.background.fill.fore_color.rgb = selected_theme["background"]

        slide.shapes.title.text = title
        slide.shapes.title.text_frame.paragraphs[0].font.size = TITLE_FONT_SIZE
        slide.shapes.title.text_frame.paragraphs[0].font.name = selected_theme["font_name"]
        slide.shapes.title.text_frame.paragraphs[0].font.color.rgb = selected_theme["title_color"]

        has_image = (i == 0 and include_images)
        content = generate_slide_content(title, has_image=has_image, summarize=summarize, language=language)

        content_left = Inches(0.5)
        content_top = Inches(1.2)
        content_width = Inches(4.5) if has_image else Inches(9)
        content_height = Inches(5.5)
        textbox = slide.shapes.add_textbox(content_left, content_top, content_width, content_height)
        text_frame = textbox.text_frame
        text_frame.text = content
        text_frame.word_wrap = True
        for paragraph in text_frame.paragraphs:
            paragraph.font.size = CONTENT_FONT_SIZE
            paragraph.font.name = selected_theme["font_name"]
            paragraph.font.color.rgb = selected_theme["text_color"]
            paragraph.space_after = Pt(8)

        if has_image:
            image_stream = generate_image(f"{title} related to {content}", language)
            if image_stream:
                slide.shapes.add_picture(image_stream, Inches(5.5), Inches(1.2), width=Inches(4))

        if csv_file and i == 1:  # Add chart to second slide
            csv_file.seek(0)  # Reset file pointer
            generate_chart(slide, csv_file, chart_type)

    output_dir = "generated_ppt"
    os.makedirs(output_dir, exist_ok=True)
    output_filepath = os.path.join(output_dir, f"{topic or 'presentation'}_presentation.pptx")
    prs.save(output_filepath)
    return output_filepath

# API endpoint to generate and download the presentation
@app.route('/generate', methods=['POST'])
def generate():
    topic = request.form.get('topic')
    text_file = request.files.get('textFile')
    csv_file = request.files.get('csvFile')
    theme = request.form.get('theme', 'professional')
    language = request.form.get('language', 'en')
    include_images = request.form.get('includeImages', 'true') == 'true'
    summarize = request.form.get('summarize', 'false') == 'true'
    chart_type = request.form.get('chartType', 'bar')
    export_format = request.form.get('exportFormat', 'pptx')

    if not topic and not text_file:
        return jsonify({"error": "Topic or text file is required"}), 400

    try:
        pptx_path = create_presentation(
            topic=topic,
            text_file=text_file,
            csv_file=csv_file,
            theme=theme,
            language=language,
            include_images=include_images,
            summarize=summarize,
            chart_type=chart_type
        )
        if export_format == 'pdf':
            return jsonify({"error": "PDF export not yet implemented"}), 501
        return send_file(pptx_path, as_attachment=True, download_name=f"{topic or 'presentation'}.pptx")
    except Exception as e:
        print(f"Error generating presentation: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)