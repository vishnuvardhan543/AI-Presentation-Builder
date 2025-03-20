import os
import logging
from flask import Flask, send_file, request, jsonify
from flask_cors import CORS
from pptx import Presentation
from pptx.util import Pt, Inches
from pptx.dml.color import RGBColor
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE
from pptx.oxml.xmlchemy import OxmlElement
from pptx.oxml.ns import qn
import google.generativeai as genai
import re
import requests
from io import BytesIO
import base64
import pandas as pd
from dotenv import load_dotenv
from pathlib import Path
from fpdf import FPDF
from PIL import Image
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
import tempfile

load_dotenv()
logging.basicConfig(level=logging.DEBUG)
app = Flask(__name__)
CORS(app)

genai_api_key = os.environ.get('GENAI_API_KEY')
if not genai_api_key:
    app.logger.error("GENAI_API_KEY is not set in the environment!")
    raise ValueError("GENAI_API_KEY is required")
genai.configure(api_key=genai_api_key)

THEMES = {
    "corporate": {
        "gradient_start": RGBColor(0, 51, 102),
        "gradient_end": RGBColor(173, 216, 230),
        "title_color": RGBColor(255, 255, 255),
        "text_color": RGBColor(255, 255, 255),
        "accent_color": RGBColor(255, 215, 0),
        "font_name": "Arial",
        "shadow": True,
        "variants": {
            "professional": {
                "layout": "clean",
                "font_name": "Calibri",
                "bullet_style": "square"
            },
            "creative": {
                "layout": "asymmetric",
                "font_name": "Segoe UI",
                "bullet_style": "circle"
            },
            "minimal": {
                "layout": "centered",
                "font_name": "Arial",
                "bullet_style": "dash"
            }
        }
    },
    "creative": {
        "gradient_start": RGBColor(147, 112, 219),
        "gradient_end": RGBColor(255, 182, 193),
        "title_color": RGBColor(255, 255, 255),
        "text_color": RGBColor(240, 240, 240),
        "accent_color": RGBColor(0, 255, 127),
        "font_name": "Montserrat",
        "shadow": True,
        "variants": {
            "professional": {
                "layout": "structured",
                "font_name": "Verdana",
                "bullet_style": "arrow"
            },
            "creative": {
                "layout": "dynamic",
                "font_name": "Comic Sans MS",
                "bullet_style": "star"
            },
            "minimal": {
                "layout": "simple",
                "font_name": "Tahoma",
                "bullet_style": "dot"
            }
        }
    },
    "minimal": {
        "gradient_start": RGBColor(245, 245, 245),
        "gradient_end": RGBColor(255, 255, 255),
        "title_color": RGBColor(33, 33, 33),
        "text_color": RGBColor(66, 66, 66),
        "accent_color": RGBColor(0, 150, 199),
        "font_name": "Helvetica",
        "shadow": False,
        "variants": {
            "professional": {
                "layout": "grid",
                "font_name": "Helvetica",
                "bullet_style": "none"
            },
            "creative": {
                "layout": "freeform",
                "font_name": "Gill Sans",
                "bullet_style": "checkmark"
            },
            "minimal": {
                "layout": "spacious",
                "font_name": "Arial Narrow",
                "bullet_style": "hyphen"
            }
        }
    },
    "bold": {
        "gradient_start": RGBColor(255, 69, 0),
        "gradient_end": RGBColor(255, 215, 0),
        "title_color": RGBColor(255, 255, 255),
        "text_color": RGBColor(255, 255, 255),
        "accent_color": RGBColor(0, 0, 0),
        "font_name": "Impact",
        "shadow": True,
        "variants": {
            "professional": {
                "layout": "strong",
                "font_name": "Arial Black",
                "bullet_style": "triangle"
            },
            "creative": {
                "layout": "expressive",
                "font_name": "Impact",
                "bullet_style": "diamond"
            },
            "minimal": {
                "layout": "bold-minimal",
                "font_name": "Franklin Gothic",
                "bullet_style": "arrow"
            }
        }
    }
}

CHART_TYPES = {
    "bar": XL_CHART_TYPE.COLUMN_CLUSTERED,
    "line": XL_CHART_TYPE.LINE,
    "pie": XL_CHART_TYPE.PIE,
    "scatter": XL_CHART_TYPE.XY_SCATTER,
}

TITLE_FONT_SIZE = Pt(36)
CONTENT_FONT_SIZE = Pt(20)

def apply_gradient(slide, start_color, end_color):
    background = slide.background
    fill = background.fill
    fill.gradient()
    fill.gradient_stops[0].color.rgb = start_color
    fill.gradient_stops[1].color.rgb = end_color
    fill.gradient_angle = 45

def add_text_shadow(text_frame):
    for paragraph in text_frame.paragraphs:
        for run in paragraph.runs:
            add_shadow_to_run(run)

def add_shadow_to_run(run):
    rPr = run._r.get_or_add_rPr()
    effectLst = rPr.find(qn('a:effectLst'))
    if effectLst is None:
        effectLst = OxmlElement('a:effectLst')
        rPr.append(effectLst)
    
    outerShdw = effectLst.find(qn('a:outerShdw'))
    if outerShdw is None:
        outerShdw = OxmlElement('a:outerShdw')
        outerShdw.set('blurRad', '40000')
        outerShdw.set('dist', '20000')
        outerShdw.set('dir', '5400000')
        outerShdw.set('rotWithShape', '0')
        
        srgbClr = OxmlElement('a:srgbClr')
        srgbClr.set('val', '323232')
        
        alpha = OxmlElement('a:alpha')
        alpha.set('val', '50000')
        srgbClr.append(alpha)
        
        outerShdw.append(srgbClr)
        effectLst.append(outerShdw)

def process_titles(text):
    try:
        lines = text.strip().split('\n')
        titles = [line.strip() for line in lines if line.strip()]
        return titles[:3]
    except Exception as e:
        app.logger.exception("Error processing titles")
        return [text]

def process_bullet_points(text):
    try:
        lines = text.split('\n')
        cleaned_lines = []
        for line in lines:
            line = line.strip()
            if line:
                line = re.sub(r'[\*\[\]]', '', line)
                line = re.sub(r'^[\d\.\-\s]+', '', line)
                cleaned_lines.append('- ' + line.strip())
        return '\n'.join(cleaned_lines)
    except Exception as e:
        app.logger.exception("Error processing bullet points")
        return text

def generate_slide_titles(content, language="en", desired_count=5):
    try:
        lang_name = "Hindi" if language == "hi" else "Telugu" if language == "te" else language.capitalize()
        prompt = f"""Generate exactly {desired_count} unique and interesting slide titles for a presentation on '{content}' in {lang_name}.
        The titles should:
        - Be concise (3-6 words each)
        - Cover different aspects of the topic
        - Not be repetitive or use numbering
        - Be engaging and informative
        
        Format as a simple list with one title per line, no preamble or extra formatting."""
        
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        titles_text = response.text.strip()
        
        titles = process_titles(titles_text)
        
        seen_titles = set()
        unique_titles = []
        for title in titles:
            if title.lower() not in seen_titles:
                unique_titles.append(title)
                seen_titles.add(title.lower())
        
        while len(unique_titles) < desired_count:
            index = len(unique_titles) + 1
            aspects = ["Applications", "Benefits", "Challenges", "Future", "Implementation", 
                       "History", "Case Studies", "Best Practices", "Technologies", "Impact"]
            aspect = aspects[(index - 1) % len(aspects)]
            new_title = f"{content} {aspect}"
            if new_title.lower() not in seen_titles:
                unique_titles.append(new_title)
                seen_titles.add(new_title.lower())
        
        return unique_titles[:desired_count]
    except Exception as e:
        app.logger.exception(f"Failed to generate titles: {str(e)}")
        fallback_titles = []
        aspects = ["Overview", "Introduction", "Applications", "Benefits", "Challenges", 
                  "Future Trends", "Implementation", "Case Studies", "Best Practices", "Impact"]
        for i in range(min(desired_count, len(aspects))):
            fallback_titles.append(f"{content} {aspects[i]}")
        return fallback_titles[:desired_count]

def generate_slide_content(slide_title, has_image=True, language="en"):
    try:
        lang_name = "Hindi" if language == "hi" else "Telugu" if language == "te" else language.capitalize()
        if has_image:
            prompt = f"Generate two concise paragraphs (max 50 words each) for '{slide_title}' in {lang_name}, no preamble or labels."
            max_tokens = 150
        else:
            prompt = f"Generate six concise bullet points (max 25 words each) for '{slide_title}' in {lang_name}. Use '-' as bullet marker, no numbering."
            max_tokens = 300
        
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        content = response.text.strip()
        
        if not has_image:
            content = process_bullet_points(content)
        return content
    except Exception as e:
        app.logger.exception(f"Failed to generate content for '{slide_title}': {str(e)}")
        return f"Content generation failed: {str(e)}"

def generate_image(prompt, language="en"):
    try:
        stability_api_key = os.environ.get('STABILITY_API_KEY')
        
        if not stability_api_key:
            app.logger.error("STABILITY_API_KEY is not set in the environment!")
            return None
        
        api_url = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"
        headers = {"Authorization": f"Bearer {stability_api_key}", "Content-Type": "application/json"}
        
        # Create a generic prompt that doesn't include the potentially non-English text
        if language != "en":
            # For non-English, use a generic prompt based on the slide context
            # Extract the topic by taking the first word or use "presentation" as fallback
            topic_words = prompt.split()
            topic = topic_words[0] if topic_words else "presentation"
            generic_prompt = f"Professional illustration for {topic} presentation"
        else:
            # For English, we can use the full prompt
            generic_prompt = prompt
            
        payload = {
            "text_prompts": [{"text": f"{generic_prompt}, professional high-quality illustration"}],
            "cfg_scale": 7,
            "height": 1024,
            "width": 1024,
            "samples": 1,
            "steps": 30,
        }
        
        response = requests.post(api_url, headers=headers, json=payload)
        response.raise_for_status()
        
        data = response.json()
        
        if "artifacts" in data and len(data["artifacts"]) > 0:
            image_b64 = data["artifacts"][0]["base64"]
            image_data = base64.b64decode(image_b64)
            
            image_stream = BytesIO(image_data)
            image_stream.seek(0)
            
            return image_stream
        else:
            return None
            
    except Exception as e:
        app.logger.exception(f"Error generating image: {str(e)}")
        return None

def generate_chart(slide, csv_file, chart_type="bar", language="en"):
    try:
        # Create a temporary copy of the file to work with
        csv_file.seek(0)
        df = pd.read_csv(csv_file)
        
        chart_data = CategoryChartData()
        chart_data.categories = df.iloc[:, 0].tolist()
        chart_data.add_series('Data', df.iloc[:, 1].tolist())
        chart_type_enum = CHART_TYPES.get(chart_type, XL_CHART_TYPE.COLUMN_CLUSTERED)
        chart = slide.shapes.add_chart(
            chart_type_enum,
            Inches(5.5), Inches(1.2),
            Inches(4), Inches(3),
            chart_data
        ).chart
        chart.has_title = True
        chart.chart_title.text_frame.text = "डेटा अवलोकन" if language == "hi" else "డేటా అవలోకనం" if language == "te" else "Data Overview"
        chart.chart_title.text_frame.paragraphs[0].font.size = Pt(14)
        chart.chart_title.text_frame.paragraphs[0].font.name = "Mangal" if language == "hi" else "Gautami" if language == "te" else "Arial"
    except Exception as e:
        app.logger.exception(f"Error generating chart: {str(e)}")

def add_design_elements(slide, theme, variant_info):
    try:
        layout_style = variant_info.get("layout", "clean")
        
        if layout_style in ["clean", "professional", "structured"]:
            shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.1), Inches(0.5), Inches(0.2), Inches(6.5))
            shape.fill.solid()
            shape.fill.fore_color.rgb = theme["accent_color"]
            shape.line.fill.background()
            
        elif layout_style in ["dynamic", "creative", "asymmetric"]:
            shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.5), Inches(5.0), Inches(3.0), Inches(2.0))
            shape.fill.solid()
            shape.fill.fore_color.rgb = theme["accent_color"]
            shape.fill.transparency = 0.7
            shape.line.fill.background()
            
        elif layout_style in ["minimal", "simple", "spacious"]:
            shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.5), Inches(7.0), Inches(9.0), Inches(0.03))
            shape.fill.solid()
            shape.fill.fore_color.rgb = theme["accent_color"]
            shape.line.fill.background()
    except Exception as e:
        app.logger.warning(f"Could not add design elements: {str(e)}")

def apply_variant_styling(slide, theme, variant_info, is_title_slide=False):
    try:
        layout_style = variant_info.get("layout", "clean")
        bullet_style = variant_info.get("bullet_style", "square")
        
        if bullet_style in ["square", "triangle", "none", "arrow"]:
            if not is_title_slide:
                left_bar = slide.shapes.add_shape(
                    MSO_SHAPE.RECTANGLE, Inches(0.2), Inches(0.7), Inches(0.08), Inches(6.5))
                left_bar.fill.solid()
                left_bar.fill.fore_color.rgb = theme["accent_color"]
                left_bar.line.fill.background()
                
                bottom_line = slide.shapes.add_shape(
                    MSO_SHAPE.RECTANGLE, Inches(0.2), Inches(7.0), Inches(12.9), Inches(0.03))
                bottom_line.fill.solid()
                bottom_line.fill.fore_color.rgb = theme["accent_color"]
                bottom_line.fill.transparency = 0.3
                bottom_line.line.fill.background()
                
                corner_accent = slide.shapes.add_shape(
                    MSO_SHAPE.RIGHT_TRIANGLE, Inches(12.5), Inches(0), Inches(0.8), Inches(0.8))
                corner_accent.fill.solid()
                corner_accent.fill.fore_color.rgb = theme["accent_color"]
                corner_accent.fill.transparency = 0.7
                corner_accent.line.fill.background()
            
            if is_title_slide:
                title_underline = slide.shapes.add_shape(
                    MSO_SHAPE.RECTANGLE, Inches(1.0), Inches(2.5), Inches(6.0), Inches(0.05))
                title_underline.fill.solid()
                title_underline.fill.fore_color.rgb = theme["accent_color"]
                title_underline.line.fill.background()
                
                for i in range(3):
                    size = Inches(0.7 - i*0.2)
                    corner_box = slide.shapes.add_shape(
                        MSO_SHAPE.RECTANGLE, Inches(13.33 - size), Inches(7.5 - size), size, size)
                    corner_box.fill.solid()
                    corner_box.fill.fore_color.rgb = theme["accent_color"]
                    corner_box.fill.transparency = 0.3 + (i * 0.2)
                    corner_box.line.fill.background()
        
        elif bullet_style in ["circle", "star", "checkmark", "diamond"]:
            if not is_title_slide:
                for i in range(4):
                    size = Inches(0.4)
                    circle = slide.shapes.add_shape(
                        MSO_SHAPE.OVAL, Inches(12.5 - i*0.4), Inches(0.3 + i*0.3), size, size)
                    circle.fill.solid()
                    circle.fill.fore_color.rgb = theme["accent_color"]
                    circle.fill.transparency = 0.2 + (i * 0.1)
                    circle.line.fill.background()
                
                swoosh = slide.shapes.add_shape(
                    MSO_SHAPE.CURVED_RIGHT_ARROW, Inches(10.0), Inches(6.5), Inches(3.0), Inches(0.8))
                swoosh.fill.solid()
                swoosh.fill.fore_color.rgb = theme["accent_color"]
                swoosh.fill.transparency = 0.6
                swoosh.line.fill.background()
                
                for i in range(3):
                    diamond = slide.shapes.add_shape(
                        MSO_SHAPE.DIAMOND, Inches(0.2 + i*0.3), Inches(6.8 - i*0.3), Inches(0.3), Inches(0.3))
                    diamond.fill.solid()
                    diamond.fill.fore_color.rgb = theme["accent_color"]
                    diamond.fill.transparency = 0.4
                    diamond.line.fill.background()
            
            if is_title_slide:
                arc = slide.shapes.add_shape(
                    MSO_SHAPE.ARC, Inches(9.0), Inches(1.0), Inches(4.0), Inches(4.0))
                arc.fill.solid()
                arc.fill.fore_color.rgb = theme["accent_color"]
                arc.fill.transparency = 0.7
                arc.line.fill.background()
                
                for i in range(3):
                    size = Inches(1.5)
                    circle = slide.shapes.add_shape(
                        MSO_SHAPE.OVAL, Inches(11.0 - i*0.8), Inches(5.5 + i*0.4), size, size)
                    circle.fill.solid()
                    circle.fill.fore_color.rgb = theme["accent_color"]
                    circle.fill.transparency = 0.6 + (i * 0.1)
                    circle.line.fill.background()
        
        elif bullet_style in ["dash", "hyphen", "dot"]:
            if not is_title_slide:
                top_border = slide.shapes.add_shape(
                    MSO_SHAPE.RECTANGLE, Inches(0.5), Inches(0.3), Inches(12.33), Inches(0.02))
                top_border.fill.solid()
                top_border.fill.fore_color.rgb = theme["accent_color"]
                top_border.fill.transparency = 0.5
                top_border.line.fill.background()
                
                corner = slide.shapes.add_shape(
                    MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(0.5), Inches(0.06))
                corner.fill.solid()
                corner.fill.fore_color.rgb = theme["accent_color"]
                corner.fill.transparency = 0.3
                corner.line.fill.background()
                
                vert_accent = slide.shapes.add_shape(
                    MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(0.06), Inches(0.5))
                vert_accent.fill.solid()
                vert_accent.fill.fore_color.rgb = theme["accent_color"]
                vert_accent.fill.transparency = 0.3
                vert_accent.line.fill.background()
            
            if is_title_slide:
                title_line = slide.shapes.add_shape(
                    MSO_SHAPE.RECTANGLE, Inches(1.0), Inches(1.8), Inches(4.0), Inches(0.03))
                title_line.fill.solid()
                title_line.fill.fore_color.rgb = theme["accent_color"]
                title_line.line.fill.background()
                
                dot = slide.shapes.add_shape(
                    MSO_SHAPE.OVAL, Inches(0.5), Inches(1.7), Inches(0.15), Inches(0.15))
                dot.fill.solid()
                dot.fill.fore_color.rgb = theme["accent_color"]
                dot.line.fill.background()
    
    except Exception as e:
        app.logger.warning(f"Error applying variant styling: {str(e)}")

def apply_bullet_styling(paragraph, bullet_style, theme_color):
    try:
        if bullet_style == "square":
            paragraph.bullet.character = '■'
        elif bullet_style == "circle":
            paragraph.bullet.character = '●'
        elif bullet_style == "dash":
            paragraph.bullet.character = '—'
        elif bullet_style == "arrow":
            paragraph.bullet.character = '➔'
        elif bullet_style == "star":
            paragraph.bullet.character = '★'
        elif bullet_style == "checkmark":
            paragraph.bullet.character = '✓'
        elif bullet_style == "diamond":
            paragraph.bullet.character = '◆'
        elif bullet_style == "triangle":
            paragraph.bullet.character = '▶'
        elif bullet_style == "dot":
            paragraph.bullet.character = '•'
        else:
            paragraph.bullet.character = '•'
            
        paragraph.bullet.font.color.rgb = theme_color
    except:
        paragraph.bullet = True

def create_presentation(topic, text_file=None, csv_file=None, theme="corporate", variant="professional", language="en", include_images=True, summarize=False, chart_type="bar", export_format="pptx", slide_count=5):
    try:
        prs = Presentation()
        selected_theme = THEMES.get(theme, THEMES["corporate"])
        variant_info = selected_theme["variants"].get(variant, selected_theme["variants"]["professional"])
        
        prs.slide_width = Inches(13.33)
        prs.slide_height = Inches(7.5)

        content = topic
        if text_file:
            content = text_file.read().decode('utf-8')

        desired_content_slides = min(int(slide_count), 10) - 1
        slide_titles = generate_slide_titles(content, language, desired_content_slides + 1)
        
        while len(slide_titles) < desired_content_slides + 1:
            default_aspects = ["Overview", "Applications", "Benefits", "Challenges", "Future Trends", 
                            "Implementation", "Case Studies", "Best Practices", "Impact", "Technologies"]
            index = len(slide_titles)
            new_title = f"{topic} {default_aspects[index % len(default_aspects)]}"
            slide_titles.append(new_title)
        
        title_slide = prs.slides.add_slide(prs.slide_layouts[6])
        apply_gradient(title_slide, selected_theme["gradient_start"], selected_theme["gradient_end"])
        
        add_design_elements(title_slide, selected_theme, variant_info)
        apply_variant_styling(title_slide, selected_theme, variant_info, is_title_slide=True)
        
        title_shape = title_slide.shapes.add_textbox(
            Inches(1.0), Inches(2.5), Inches(10.0), Inches(1.5))
        title_tf = title_shape.text_frame
        title_tf.text = slide_titles[0]
        title_tf.paragraphs[0].font.size = TITLE_FONT_SIZE
        title_tf.paragraphs[0].font.name = "Mangal" if language == "hi" else "Gautami" if language == "te" else variant_info["font_name"]
        title_tf.paragraphs[0].font.color.rgb = selected_theme["title_color"]
        title_tf.paragraphs[0].font.bold = True
        title_tf.paragraphs[0].alignment = PP_ALIGN.CENTER
        
        if selected_theme["shadow"]:
            add_text_shadow(title_tf)
            
        subtitle_shape = title_slide.shapes.add_textbox(
            Inches(2.0), Inches(4.0), Inches(8.0), Inches(1.0))
        subtitle_tf = subtitle_shape.text_frame
        subtitle_tf.text = "Powered by AI"
        subtitle_tf.paragraphs[0].font.size = Pt(24)
        subtitle_tf.paragraphs[0].font.name = "Mangal" if language == "hi" else "Gautami" if language == "te" else variant_info["font_name"]
        subtitle_tf.paragraphs[0].font.color.rgb = selected_theme["text_color"]
        subtitle_tf.paragraphs[0].alignment = PP_ALIGN.CENTER
        
        for i, title in enumerate(slide_titles):
            slide = prs.slides.add_slide(prs.slide_layouts[6])
            apply_gradient(slide, selected_theme["gradient_start"], selected_theme["gradient_end"])
            
            add_design_elements(slide, selected_theme, variant_info)
            apply_variant_styling(slide, selected_theme, variant_info)
            
            title_shape = slide.shapes.add_textbox(
                Inches(0.5), Inches(0.5), Inches(11.0), Inches(0.8))
            title_tf = title_shape.text_frame
            title_tf.text = title
            title_tf.paragraphs[0].font.size = TITLE_FONT_SIZE
            title_tf.paragraphs[0].font.name = "Mangal" if language == "hi" else "Gautami" if language == "te" else variant_info["font_name"]
            title_tf.paragraphs[0].font.color.rgb = selected_theme["title_color"]
            title_tf.paragraphs[0].font.bold = True
            
            content_text = generate_slide_content(title, include_images, language)
            
            if include_images and (i % 2 == 0):
                textbox = slide.shapes.add_textbox(
                    Inches(0.5), Inches(1.5), Inches(5.75), Inches(5.0))
            else:
                textbox = slide.shapes.add_textbox(
                    Inches(0.7), Inches(1.5), Inches(11.0), Inches(5.0))
            
            tf = textbox.text_frame
            tf.word_wrap = True
            tf.text = content_text
            
            if content_text.startswith('-'):
                tf.text = ""
                lines = content_text.split('\n')
                for line_idx, line in enumerate(lines):
                    p = tf.add_paragraph()
                    p.text = line.lstrip('- ')
                    p.level = 0
                    p.font.size = CONTENT_FONT_SIZE
                    p.font.name = "Mangal" if language == "hi" else "Gautami" if language == "te" else variant_info["font_name"]
                    p.font.color.rgb = selected_theme["text_color"]
                    
                    bullet_style = variant_info.get("bullet_style", "square")
                    apply_bullet_styling(p, bullet_style, selected_theme["accent_color"])
            else:
                for paragraph in tf.paragraphs:
                    paragraph.font.size = CONTENT_FONT_SIZE
                    paragraph.font.name = "Mangal" if language == "hi" else "Gautami" if language == "te" else variant_info["font_name"]
                    paragraph.font.color.rgb = selected_theme["text_color"]
                    paragraph.space_after = Pt(12)
            
            if selected_theme["shadow"]:
                add_text_shadow(tf)
            
            if include_images and (i % 2 == 0):
                image_stream = generate_image(f"{title} related to {content_text}", language)
                if image_stream:
                    slide.shapes.add_picture(image_stream, Inches(7.0), Inches(1.5), width=Inches(5.5))
                else:
                    textbox.width = Inches(11.0)
        
        # Add chart slide if CSV file is provided
        if csv_file:
            chart_slide = prs.slides.add_slide(prs.slide_layouts[6])
            apply_gradient(chart_slide, selected_theme["gradient_start"], selected_theme["gradient_end"])
            
            add_design_elements(chart_slide, selected_theme, variant_info)
            apply_variant_styling(chart_slide, selected_theme, variant_info)
            
            title_shape = chart_slide.shapes.add_textbox(
                Inches(0.5), Inches(0.5), Inches(11.0), Inches(0.8))
            title_tf = title_shape.text_frame
            chart_title = "Data Analysis" if language == "en" else "डेटा विश्लेषण" if language == "hi" else "డేటా విశ్లేషణ"
            title_tf.text = chart_title
            title_tf.paragraphs[0].font.size = TITLE_FONT_SIZE
            title_tf.paragraphs[0].font.name = "Mangal" if language == "hi" else "Gautami" if language == "te" else variant_info["font_name"]
            title_tf.paragraphs[0].font.color.rgb = selected_theme["title_color"]
            title_tf.paragraphs[0].font.bold = True
            
            # Left side text explanation
            textbox = chart_slide.shapes.add_textbox(
                Inches(0.7), Inches(1.5), Inches(4.0), Inches(5.0))
            tf = textbox.text_frame
            tf.word_wrap = True
            
            chart_explanation = "This chart visualizes the key data points related to our topic. The data shows trends and patterns that support our analysis."
            if language == "hi":
                chart_explanation = "यह चार्ट हमारे विषय से संबंधित प्रमुख डेटा बिंदुओं को दर्शाता है। डेटा ऐसे रुझान और पैटर्न दिखाता है जो हमारे विश्लेषण का समर्थन करते हैं।"
            elif language == "te":
                chart_explanation = "ఈ చార్ట్ మన అంశానికి సంబంధించిన కీలక డేటా పాయింట్లను చూపిస్తుంది. డేటా మన విశ్లేషణకు మద్దతు ఇచ్చే ధోరణులు మరియు నమూనాలను చూపిస్తుంది."
            
            tf.text = chart_explanation
            
            for paragraph in tf.paragraphs:
                paragraph.font.size = CONTENT_FONT_SIZE
                paragraph.font.name = "Mangal" if language == "hi" else "Gautami" if language == "te" else variant_info["font_name"]
                paragraph.font.color.rgb = selected_theme["text_color"]
                paragraph.space_after = Pt(12)
            
            if selected_theme["shadow"]:
                add_text_shadow(tf)
            
            # Generate chart on the right side
            generate_chart(chart_slide, csv_file, chart_type, language)

        for slide in prs.slides:
            footer = slide.shapes.add_textbox(Inches(0.5), Inches(7.0), Inches(12.0), Inches(0.3))
            tf = footer.text_frame
            tf.text = f"{topic} | {pd.Timestamp.now().strftime('%Y-%m-%d')}"
            tf.paragraphs[0].font.size = Pt(9)
            tf.paragraphs[0].font.color.rgb = selected_theme["text_color"]
            tf.paragraphs[0].font.italic = True
            tf.paragraphs[0].alignment = PP_ALIGN.RIGHT

        output_dir = tempfile.mkdtemp()
        pptx_filepath = os.path.join(output_dir, f"{topic or 'presentation'}_presentation.pptx")
        prs.save(pptx_filepath)
        
        return pptx_filepath
    except Exception as e:
        app.logger.exception("Error in create_presentation")
        raise e

def ensure_slide_has_title(slide):
    has_title = False
    for shape in slide.shapes:
        if hasattr(shape, 'placeholder_format') and shape.placeholder_format.type == 1:
            has_title = True
            break
    
    if not has_title:
        title_shape = slide.shapes.add_textbox(
            Inches(0.5), Inches(0.5), Inches(9.0), Inches(1.0)
        )
        title_shape.text_frame.text = "Slide Title"
        return title_shape
    
    return slide.shapes.title

@app.route('/generate', methods=['POST'])
def generate():
    topic = request.form.get('topic')
    text_file = request.files.get('textFile')
    csv_file = request.files.get('csvFile')
    theme = request.form.get('theme', 'corporate')
    variant = request.form.get('variant', 'professional')
    language = request.form.get('language', 'en')
    include_images = request.form.get('includeImages', 'true') == 'true'
    summarize = request.form.get('summarize', 'false') == 'true'
    chart_type = request.form.get('chartType', 'bar')
    export_format = request.form.get('exportFormat', 'pptx')
    slide_count = request.form.get('slideCount', '5')
    
    # Validate chart_type
    if chart_type not in CHART_TYPES:
        chart_type = 'bar'
    
    try:
        slide_count = int(slide_count)
        if slide_count < 3:
            slide_count = 3
        elif slide_count > 10:
            slide_count = 10
    except ValueError:
        slide_count = 5

    if not topic and not text_file:
        return jsonify({"error": "Topic or text file required"}), 400

    try:
        output_filepath = create_presentation(
            topic=topic,
            text_file=text_file,
            csv_file=csv_file,
            theme=theme,
            variant=variant,
            language=language,
            include_images=include_images,
            summarize=summarize,
            chart_type=chart_type,
            export_format=export_format,
            slide_count=slide_count
        )
        
        download_name = f"{topic or 'presentation'}_presentation"
        
        if export_format == 'pdf':
            try:
                pdf_filepath = output_filepath.replace('.pptx', '.pdf')
                
                pdf = FPDF()
                pdf.set_auto_page_break(auto=True, margin=15)
                
                prs = Presentation(output_filepath)
                
                pdf.add_page()
                pdf.set_font("Arial", 'B', 24)
                pdf.cell(0, 20, txt=topic or "AI-Generated Presentation", ln=True, align='C')
                pdf.set_font("Arial", 'I', 14)
                pdf.cell(0, 10, txt=f"Created on {pd.Timestamp.now().strftime('%Y-%m-%d')}", ln=True, align='C')
                
                for i, slide in enumerate(prs.slides):
                    pdf.add_page()
                    
                    pdf.set_font("Arial", 'I', 10)
                    pdf.cell(0, 10, txt=f"Slide {i+1}", ln=True, align='R')
                    
                    if len(slide.shapes.title.text_frame.text) > 0:
                        pdf.set_font("Arial", 'B', 16)
                        pdf.cell(0, 15, txt=slide.shapes.title.text_frame.text, ln=True)
                    
                    pdf.set_font("Arial", '', 12)
                    for shape in slide.shapes:
                        if hasattr(shape, "text_frame") and hasattr(shape.text_frame, "text"):
                            if shape.text_frame.text and shape != slide.shapes.title:
                                for paragraph in shape.text_frame.paragraphs:
                                    text = paragraph.text.strip()
                                    if text:
                                        pdf.multi_cell(0, 8, txt=text)
                                        pdf.ln(4)
                
                pdf.output(pdf_filepath)
                
                if os.path.exists(pdf_filepath):
                    return send_file(pdf_filepath, as_attachment=True, download_name=f"{download_name}.pdf")
                else:
                    return send_file(output_filepath, as_attachment=True, download_name=f"{download_name}.pptx")
            except Exception as e:
                app.logger.exception("PDF conversion failed, falling back to PPTX")
                return send_file(output_filepath, as_attachment=True, download_name=f"{download_name}.pptx")
        else:
            return send_file(output_filepath, as_attachment=True, download_name=f"{download_name}.pptx")
    except Exception as e:
        app.logger.exception("Error generating presentation")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)