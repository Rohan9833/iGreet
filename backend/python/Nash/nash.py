import argparse
import uuid
import os
import shutil
from rembg import new_session,remove # type: ignore
from PIL import Image, ImageDraw, ImageFont
from moviepy.editor import VideoFileClip, ImageClip, CompositeVideoClip

# ========== Helper Functions ==========

def autocrop_alpha(image: Image.Image) -> Image.Image:
    alpha = image.split()[-1]
    bbox = alpha.getbbox()
    return image.crop(bbox) if bbox else image

def draw_centered_text(draw, text, font, center_x, y_pos, line_spacing):
    bbox = font.getbbox(text)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    draw.text((center_x - text_width // 2, y_pos), text, font=font, fill=(255, 255, 255, 255))
    return text_height + line_spacing

def generate_banner(image_path, name, qualification, specialization, hospital, temp_dir):
    # Fonts
    font_name = ImageFont.truetype("AnekLatin[wdth,wght].ttf", size=65)
    font_other = ImageFont.truetype("Poppins-Medium.ttf", size=26)

    # Coordinates
    center_x = 250
    y = 290
    
    session = new_session("u2net_human_seg")

    # Load and process image
    input_img = Image.open(image_path)
    bg_removed = remove(input_img, session=session).convert("RGBA")
    bg_removed = autocrop_alpha(bg_removed)
    bg_removed = resize_if_needed(bg_removed)

    # Load and paste banner
    banner = Image.open("nashban.png").convert("RGBA")
    banner_width, banner_height = banner.size
    final_image = Image.new("RGBA", (banner_width, banner_height), (0, 0, 0, 0))
    final_image.paste(banner, (0, 0))

    # Paste person image
    image_width, image_height = bg_removed.size
    image_x = (banner_width - image_width) + 5
    image_y = banner_height - (image_height + 80)
    
    final_image.paste(bg_removed, (image_x, image_y), bg_removed)
    
    # Add text
    draw = ImageDraw.Draw(final_image)
    y += draw_centered_text(draw, name, font_name, center_x, y, line_spacing=20)
    y += draw_centered_text(draw, qualification, font_other, center_x, y, line_spacing=7)
    y += draw_centered_text(draw, specialization, font_other, center_x, y, line_spacing=4)
    y += draw_centered_text(draw, hospital, font_other, center_x, y, line_spacing=2)

    banner_path = os.path.join(temp_dir, "banner.png")
    final_image.save(banner_path, "PNG")
    return banner_path

def overlay_banner_on_video(input_video_path, banner_path, output_path):
    video = VideoFileClip(input_video_path)
    banner_clip = ImageClip(banner_path).set_duration(video.duration - 2)

    banner_clip = banner_clip.set_start(2).set_position(lambda t: (
        (video.w - banner_clip.w) // 2,
        video.h + 50 - int(min(1, t) * (banner_clip.h + 50))
    ))

    final = CompositeVideoClip([video, banner_clip])
    final.write_videofile(output_path, codec="libx264", audio_codec="aac", fps=video.fps)
    
def resize_if_needed(image, min_width=500, min_height=500):
    width, height = image.size
    print("old height", width, "x", height)

    # Check if resizing is needed
    if width >= min_width or height >= min_height:
        return image

    # Compute scale factor to meet at least one dimension
    scale_w = min_width / width
    scale_h = min_height / height
    scale = min(scale_w, scale_h)

    new_size = (int(width * scale), int(height * scale))
    print("new_size", new_size)
    return image.resize(new_size, Image.LANCZOS)

# ========== Main Function ==========

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--name", required=True)
    parser.add_argument("--qualification", required=True)
    parser.add_argument("--specialization", required=True)
    parser.add_argument("--hospital", required=True)
    parser.add_argument("--input_image", required=True)
    parser.add_argument("--output_video", required=True)
    args = parser.parse_args()

    print(args.output_video)

    temp_dir = os.path.join("/tmp", str(uuid.uuid4()))
    os.makedirs(temp_dir, exist_ok=True)

    try:
        # Step 1: Create banner
        banner_path = generate_banner(
            args.input_image,
            args.name,
            args.qualification,
            args.specialization,
            args.hospital,
            temp_dir
        )

        # Step 2: Create final video
        output_path = os.path.join(args.output_video)
        overlay_banner_on_video("nash.mp4", banner_path, output_path)

        print(f" Final video saved at: {output_path}")

    except Exception as e:
        print(f"Error occurred: {e}")

    finally:
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
            print(f"Cleaned up temp directory: {temp_dir}")

# ========== Run ==========
if __name__ == "__main__":
    main()
