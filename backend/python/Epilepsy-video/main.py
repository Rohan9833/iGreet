from moviepy.editor import (
    VideoFileClip, ImageClip, ColorClip, CompositeVideoClip, TextClip
)
import moviepy.video.fx.all as vfx
from PIL import Image, ImageDraw
import numpy as np
import argparse


def remove_grey_background(clip, color=[160, 160, 160], thr=100, s=5):
    """Remove the specified color background from a video."""
    return clip.fx(vfx.mask_color, color=color, thr=thr, s=s)


def create_rounded_rectangle(width, height, corner_radius, color, bg_color):
    """Create a rounded rectangle with the given dimensions and colors."""
    image = Image.new("RGBA", (width, height), bg_color)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle([(0, 0), (width, height)], radius=corner_radius, fill=color)
    return image


def create_nameplate(name, speciality, hospital, city, text_size, font_path, rect_width, rect_height, rect_color, bg_color, text_color, video_duration):
    """Create a nameplate with a rounded rectangle and text fields."""
    # Create the rounded rectangle
    rounded_rect = create_rounded_rectangle(rect_width, rect_height, 20, rect_color, bg_color)
    rect_np = np.array(rounded_rect)
    rect_clip = ImageClip(rect_np).set_duration(video_duration)

    # Create text clips
    name_clip = TextClip(name, fontsize=text_size, color=text_color, font=font_path).set_duration(video_duration)
    speciality_clip = TextClip(speciality, fontsize=text_size - 10, color=text_color, font=font_path).set_duration(video_duration)
    hospital_clip = TextClip(hospital, fontsize=text_size - 20, color=text_color, font=font_path).set_duration(video_duration)
    city_clip = TextClip(city, fontsize=text_size - 20, color=text_color, font=font_path).set_duration(video_duration)

    # Align text vertically (left-aligned)
    text_y_start = 5
    text_x_start = 10
    name_clip = name_clip.set_position((text_x_start, text_y_start))
    speciality_clip = speciality_clip.set_position(lambda t: (text_x_start, text_y_start + name_clip.size[1]))
    hospital_clip = hospital_clip.set_position(lambda t: (text_x_start, text_y_start + name_clip.size[1] + speciality_clip.size[1]))
    city_clip = city_clip.set_position(lambda t: (text_x_start, text_y_start + name_clip.size[1] + speciality_clip.size[1] + hospital_clip.size[1]))

    # Combine rectangle and text
    combined_clip = CompositeVideoClip([rect_clip, name_clip, speciality_clip, hospital_clip, city_clip])
    return combined_clip


def main(args):
    # Default parameters
    video_path = "input.mp4"
    logo_path = "logo.png"
    font_path = "ROBOTOCONDENSED-SEMIBOLD.TTF"
    video_duration = 14
    rect_width, rect_height = 850, 250
    text_color = "#FFFFFF"

    # Load video
    video = VideoFileClip(video_path)

    # Remove background
    video_no_bg = remove_grey_background(video)

    # Load overlay image
    image_clip = ImageClip(args.image).set_duration(video_duration).resize((1080, 1100)).set_position(("center", "top")).set_start(1).fadein(1)

    # Load logo
    logo_clip = ImageClip(logo_path).set_duration(video_duration).resize((377, 185)).set_position((0, 0)).set_start(1)

    # Create white background
    white_background = ColorClip(video.size, color=(255, 255, 255)).set_duration(video.duration)

    # Create nameplate
    nameplate_clip = create_nameplate(
        name=args.name,
        speciality=args.speciality,
        hospital=args.hospital,
        city=args.city,
        text_size=60,
        font_path=font_path,
        rect_width=rect_width,
        rect_height=rect_height,
        rect_color=(0, 0, 0, 0),
        bg_color=(0, 0, 0, 0),
        text_color=text_color,
        video_duration=video_duration
    )

    # Animate logo and nameplate
    final_logo_clip = logo_clip.set_position(lambda t: (-400 + (t * 400) if t <= 1 else 0, 0)).set_start(1).set_duration(video_duration)
    final_name_clip = nameplate_clip.set_position(lambda t: (-500 + (t * 550) if t <= 1 else 50, 1020)).set_start(1).set_duration(video_duration)

    # Combine everything
    composite_clip = CompositeVideoClip([white_background, image_clip, video_no_bg, final_logo_clip, final_name_clip])

    # Write output video
    composite_clip.write_videofile(args.output, fps=24)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create a video with a nameplate and animations.")
    parser.add_argument("--image", type=str, required=True, help="Path to the image to overlay.")
    parser.add_argument("--output", type=str, required=True, help="Path to the output video file.")
    parser.add_argument("--name", type=str, required=True, help="Name text for the nameplate.")
    parser.add_argument("--speciality", type=str, required=True, help="Speciality text for the nameplate.")
    parser.add_argument("--hospital", type=str, required=True, help="Hospital name for the nameplate.")
    parser.add_argument("--city", type=str, required=True, help="City name for the nameplate.")

    args = parser.parse_args()
    main(args)
