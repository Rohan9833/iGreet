from moviepy.editor import (
    VideoFileClip,
    ImageClip,
    ColorClip,
    CompositeVideoClip,
    TextClip,
)
import moviepy.video.fx.all as vfx
from PIL import Image, ImageDraw
import numpy as np
import argparse
import os


def remove_grey_background(clip, color=(160, 160, 160), thr=100, s=5):
    """Remove the grey background from the template video."""
    return clip.fx(vfx.mask_color, color=color, thr=thr, s=s)


def create_rounded_rectangle(
    width,
    height,
    corner_radius,
    color,
    bg_color,
):
    """Create the transparent rounded rectangle used by the nameplate."""
    image = Image.new("RGBA", (width, height), bg_color)
    draw = ImageDraw.Draw(image)

    draw.rounded_rectangle(
        [(0, 0), (width, height)],
        radius=corner_radius,
        fill=color,
    )

    return image


def create_nameplate(
    name,
    speciality,
    hospital,
    city,
    text_size,
    font_path,
    rect_width,
    rect_height,
    rect_color,
    bg_color,
    text_color,
    video_duration,
):
    """Create the doctor information nameplate."""
    rounded_rect = create_rounded_rectangle(
        rect_width,
        rect_height,
        20,
        rect_color,
        bg_color,
    )

    rect_np = np.array(rounded_rect)

    rect_clip = (
        ImageClip(rect_np)
        .set_duration(video_duration)
    )

    name_clip = (
        TextClip(
            name,
            fontsize=text_size,
            color=text_color,
            font=font_path,
        )
        .set_duration(video_duration)
    )

    speciality_clip = (
        TextClip(
            speciality,
            fontsize=text_size - 10,
            color=text_color,
            font=font_path,
        )
        .set_duration(video_duration)
    )

    hospital_clip = (
        TextClip(
            hospital,
            fontsize=text_size - 20,
            color=text_color,
            font=font_path,
        )
        .set_duration(video_duration)
    )

    city_clip = (
        TextClip(
            city,
            fontsize=text_size - 20,
            color=text_color,
            font=font_path,
        )
        .set_duration(video_duration)
    )

    text_y_start = 5
    text_x_start = 10

    name_clip = name_clip.set_position(
        (text_x_start, text_y_start)
    )

    speciality_clip = speciality_clip.set_position(
        lambda t: (
            text_x_start,
            text_y_start + name_clip.size[1],
        )
    )

    hospital_clip = hospital_clip.set_position(
        lambda t: (
            text_x_start,
            text_y_start
            + name_clip.size[1]
            + speciality_clip.size[1],
        )
    )

    city_clip = city_clip.set_position(
        lambda t: (
            text_x_start,
            text_y_start
            + name_clip.size[1]
            + speciality_clip.size[1]
            + hospital_clip.size[1],
        )
    )

    return CompositeVideoClip(
        [
            rect_clip,
            name_clip,
            speciality_clip,
            hospital_clip,
            city_clip,
        ]
    )


def main(args):
    video_path = os.path.abspath(args.video)
    logo_path = os.path.abspath(args.logo)
    font_path = os.path.abspath(args.font)
    image_path = os.path.abspath(args.image)
    output_path = os.path.abspath(args.output)

    required_files = {
        "source video": video_path,
        "logo": logo_path,
        "font": font_path,
        "doctor image": image_path,
    }

    for label, file_path in required_files.items():
        if not os.path.isfile(file_path):
            raise FileNotFoundError(
                f"{label} not found: {file_path}"
            )

    output_directory = os.path.dirname(output_path)

    if output_directory:
        os.makedirs(output_directory, exist_ok=True)

    video_duration = 14
    rect_width, rect_height = 850, 250
    text_color = "#FFFFFF"

    print("EPILEPSY VIDEO GENERATOR")
    print("Source video:", video_path)
    print("Doctor image:", image_path)
    print("Logo:", logo_path)
    print("Font:", font_path)
    print("Output:", output_path)

    video = None
    video_no_bg = None
    image_clip = None
    logo_clip = None
    white_background = None
    nameplate_clip = None
    final_logo_clip = None
    final_name_clip = None
    composite_clip = None

    try:
        video = VideoFileClip(video_path)

        video_no_bg = remove_grey_background(video)

        image_clip = (
            ImageClip(image_path)
            .set_duration(video_duration)
            .resize((1080, 1100))
            .set_position(("center", "top"))
            .set_start(1)
            .fadein(1)
        )

        logo_clip = (
            ImageClip(logo_path)
            .set_duration(video_duration)
            .resize((377, 185))
            .set_position((0, 0))
            .set_start(1)
        )

        white_background = (
            ColorClip(
                video.size,
                color=(255, 255, 255),
            )
            .set_duration(video.duration)
        )

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
            video_duration=video_duration,
        )

        final_logo_clip = (
            logo_clip
            .set_position(
                lambda t: (
                    -400 + (t * 400) if t <= 1 else 0,
                    0,
                )
            )
            .set_start(1)
            .set_duration(video_duration)
        )

        final_name_clip = (
            nameplate_clip
            .set_position(
                lambda t: (
                    -500 + (t * 550) if t <= 1 else 50,
                    1020,
                )
            )
            .set_start(1)
            .set_duration(video_duration)
        )

        composite_clip = CompositeVideoClip(
            [
                white_background,
                image_clip,
                video_no_bg,
                final_logo_clip,
                final_name_clip,
            ]
        )

        print("Writing final video...")

        composite_clip.write_videofile(
            output_path,
            fps=24,
        )

        if not os.path.isfile(output_path):
            raise RuntimeError(
                "MoviePy finished without creating the output video."
            )

        output_size = os.path.getsize(output_path)

        if output_size == 0:
            raise RuntimeError(
                "MoviePy created an empty output video."
            )

        print(
            f"Epilepsy video generated successfully: "
            f"{output_path} ({output_size} bytes)"
        )

    finally:
        for clip in [
            composite_clip,
            final_name_clip,
            final_logo_clip,
            nameplate_clip,
            white_background,
            logo_clip,
            image_clip,
            video_no_bg,
            video,
        ]:
            if clip is not None:
                try:
                    clip.close()
                except Exception:
                    pass


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Create the Epilepsy doctor introduction video."
    )

    parser.add_argument(
        "--image",
        type=str,
        required=True,
        help="Path to the doctor image.",
    )

    parser.add_argument(
        "--output",
        type=str,
        required=True,
        help="Path to the output video.",
    )

    parser.add_argument(
        "--name",
        type=str,
        required=True,
        help="Doctor name.",
    )

    parser.add_argument(
        "--speciality",
        type=str,
        required=True,
        help="Doctor speciality.",
    )

    parser.add_argument(
        "--hospital",
        type=str,
        required=True,
        help="Hospital name.",
    )

    parser.add_argument(
        "--city",
        type=str,
        required=True,
        help="City name.",
    )

    parser.add_argument(
        "--video",
        type=str,
        required=True,
        help="Path to the source template video.",
    )

    parser.add_argument(
        "--logo",
        type=str,
        required=True,
        help="Path to the template logo.",
    )

    parser.add_argument(
        "--font",
        type=str,
        required=True,
        help="Path to the template font.",
    )

    args = parser.parse_args()

    main(args)
