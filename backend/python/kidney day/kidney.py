import cv2
import numpy as np
import os
import uuid
import argparse
import subprocess
import sys
import gc

from PIL import Image, ImageDraw, ImageFont
from multiprocessing import Pool


# =========================================================
# CONFIG
# =========================================================

Image.MAX_IMAGE_PIXELS = None


# =========================================================
# LOGGING
# =========================================================

def log_error(message):
    """
    Write errors to log.txt next to this Python script.
    """
    log_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "log.txt"
    )

    with open(log_path, "a", encoding="utf-8") as log_file:
        log_file.write(message + "\n")


# =========================================================
# FONT
# =========================================================

def resolve_font_path():
    candidates = [
        os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            "Lato-Heavy.ttf"
        ),
        "/usr/share/fonts/truetype/lato/Lato-Heavy.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
    ]

    for candidate in candidates:
        if os.path.isfile(candidate):
            return candidate

    return None


FONT_PATH = resolve_font_path()


def load_font(size):
    if FONT_PATH:
        return ImageFont.truetype(
            FONT_PATH,
            size
        )

    return ImageFont.load_default()


# =========================================================
# CLEANUP
# =========================================================

def clean_up_temp_folder(temp_folder):
    if not temp_folder:
        return

    try:
        if not os.path.exists(temp_folder):
            return

        for root, dirs, files in os.walk(
            temp_folder,
            topdown=False
        ):
            for name in files:
                file_path = os.path.join(
                    root,
                    name
                )

                try:
                    os.remove(file_path)
                except Exception as e:
                    log_error(
                        f"Failed to remove file {file_path}: {e}"
                    )

            for name in dirs:
                directory_path = os.path.join(
                    root,
                    name
                )

                try:
                    os.rmdir(directory_path)
                except Exception as e:
                    log_error(
                        f"Failed to remove directory {directory_path}: {e}"
                    )

        try:
            os.rmdir(temp_folder)
        except Exception as e:
            log_error(
                f"Failed to remove temp folder {temp_folder}: {e}"
            )

        print(
            f"Temporary folder cleaned up: {temp_folder}"
        )

    except Exception as e:
        log_error(
            f"Failed to clean temp folder: {e}"
        )


# =========================================================
# PROCESS ALL FRAMES
# =========================================================

def process_frames(
    input_image_path,
    frames_folder,
    output_folder,
    text1,
    text2,
    text3,
    text4
):
    try:
        # -------------------------------------------------
        # READ INPUT IMAGE
        # -------------------------------------------------

        overlay_image = cv2.imread(
            input_image_path,
            cv2.IMREAD_COLOR
        )

        if overlay_image is None:
            raise Exception(
                f"Unable to read input image: {input_image_path}"
            )

        # -------------------------------------------------
        # GET TEMPLATE FRAMES
        # -------------------------------------------------

        if not os.path.isdir(frames_folder):
            raise Exception(
                f"Frames folder does not exist: {frames_folder}"
            )

        frame_files = [
            file
            for file in os.listdir(frames_folder)
            if file.lower().endswith(".jpg")
            and file.lower().startswith("frame_")
        ]

        frame_files = sorted(
            frame_files,
            key=lambda x: int(
                x.split("_")[1].split(".")[0]
            )
        )

        if not frame_files:
            raise Exception(
                f"No frame files found in: {frames_folder}"
            )

        print(
            f"Template frames found: {len(frame_files)}"
        )

        # -------------------------------------------------
        # CREATE WORK DATA
        # -------------------------------------------------

        frame_data = [
            (
                frame_file,
                frames_folder,
                output_folder,
                overlay_image,
                text1,
                text2,
                text3,
                text4
            )
            for frame_file in frame_files
        ]

        # -------------------------------------------------
        # MULTIPROCESSING
        # -------------------------------------------------

        cpu_count = os.cpu_count() or 2

        num_workers = max(
            1,
            cpu_count - 1
        )

        chunk_size = 5

        print(
            f"Processing frames with {num_workers} workers..."
        )

        with Pool(
            processes=num_workers
        ) as pool:

            results = pool.map(
                process_frame_worker,
                frame_data,
                chunksize=chunk_size
            )

        failed_frames = [
            frame
            for frame in results
            if frame is None
        ]

        if failed_frames:
            raise Exception(
                f"Failed to process "
                f"{len(failed_frames)} frames."
            )

        print(
            f"All {len(frame_files)} frames processed successfully."
        )

    except Exception as e:
        log_error(
            f"Unexpected Error in process_frames: {e}"
        )

        raise

    finally:
        gc.collect()

        print(
            "Memory cleanup completed."
        )


# =========================================================
# FRAME WORKER
# =========================================================

def process_frame_worker(frame_data):

    (
        frame_file,
        frames_folder,
        output_folder,
        overlay_image,
        text1,
        text2,
        text3,
        text4
    ) = frame_data

    try:

        # -------------------------------------------------
        # INPUT FRAME
        # -------------------------------------------------

        frame_path = os.path.join(
            frames_folder,
            frame_file
        )

        frame = cv2.imread(
            frame_path
        )

        if frame is None:
            raise Exception(
                f"Unable to read frame: {frame_path}"
            )

        # -------------------------------------------------
        # PROCESS FRAME
        # -------------------------------------------------

        processed_frame = replace_contour_with_image(
            frame,
            overlay_image,
            int(
                frame_file.split("_")[1].split(".")[0]
            ),
            text1,
            text2,
            text3,
            text4
        )

        # -------------------------------------------------
        # OUTPUT FRAME
        # -------------------------------------------------

        output_path = os.path.join(
            output_folder,
            frame_file
        )

        success = cv2.imwrite(
            output_path,
            processed_frame
        )

        if not success:
            raise Exception(
                f"Unable to write frame: {output_path}"
            )

        return frame_file

    except Exception as e:

        log_error(
            f"Frame Processing Failed for "
            f"{frame_file}: {e}"
        )

        return None


# =========================================================
# REPLACE CONTOUR + TEXT
# =========================================================

def replace_contour_with_image(
    frame,
    overlay_image,
    frame_number,
    text1,
    text2,
    text3,
    text4
):

    # -----------------------------------------------------
    # DETECT PURPLE CONTOUR
    # -----------------------------------------------------

    largest_contour = detect_largest_contour(
        frame
    )

    if largest_contour is not None:

        x, y, w, h = cv2.boundingRect(
            largest_contour
        )

        if w > 0 and h > 0:

            overlay_resized = cv2.resize(
                overlay_image,
                (w, h),
                interpolation=cv2.INTER_AREA
            )

            frame[
                y:y + h,
                x:x + w
            ] = overlay_resized

    # -----------------------------------------------------
    # TEXT
    # -----------------------------------------------------

    text_lines = [
        text1,
        text2,
        text3,
        text4
    ]

    font_paths = [
        FONT_PATH,
        FONT_PATH,
        FONT_PATH,
        FONT_PATH
    ]

    font_sizes = [
        70,
        48,
        48,
        48
    ]

    if 19 <= frame_number <= 1415:

        frame = draw_text_on_frame(
            frame,
            frame_number,
            text_lines,
            font_paths,
            font_sizes
        )

    return frame


# =========================================================
# DETECT LARGEST PURPLE CONTOUR
# =========================================================

def detect_largest_contour(image):

    hsv_image = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2HSV
    )

    # Purple range
    lower_purple = np.array(
        [120, 30, 30]
    )

    upper_purple = np.array(
        [150, 255, 255]
    )

    mask = cv2.inRange(
        hsv_image,
        lower_purple,
        upper_purple
    )

    contours, _ = cv2.findContours(
        mask,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    if contours:

        largest_contour = max(
            contours,
            key=cv2.contourArea
        )

        return largest_contour

    return None


# =========================================================
# DRAW TEXT
# =========================================================

def draw_text_on_frame(
    frame,
    frame_number,
    text_lines,
    font_paths,
    base_font_sizes
):

    text_color = [
        (0, 0, 0),
        (29, 29, 29),
        (29, 29, 29),
        (29, 29, 29)
    ]

    line_spacing = [
        70,
        55,
        50,
        60
    ]

    endline_spacing = [
        100,
        60,
        50,
        45
    ]

    img_pil = Image.fromarray(
        cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2RGB
        )
    )

    draw = ImageDraw.Draw(
        img_pil
    )

    # -----------------------------------------------------
    # ANIMATION PROGRESS
    # -----------------------------------------------------

    progress = 0

    if (
        19 <= frame_number <= 72
        or frame_number >= 1343
    ):
        progress = 0

    elif 73 <= frame_number <= 85:

        progress = np.clip(
            (frame_number - 73)
            / (85 - 73),
            0,
            1
        )

        progress = 0.5 * (
            1 - np.cos(
                np.pi * progress
            )
        )

    elif 1327 <= frame_number <= 1342:

        progress = 1 - (
            (frame_number - 1327)
            / (1342 - 1327)
        )

        progress = 0.5 * (
            1 - np.cos(
                np.pi * progress
            )
        )

    elif 85 < frame_number < 1328:

        progress = 1

    # -----------------------------------------------------
    # POSITIONS
    # -----------------------------------------------------

    x_end = 700

    start_frame = 33
    end_frame = 55

    frame_interval = max(
        1,
        (
            end_frame - start_frame
        )
        // max(
            1,
            len(text_lines)
        )
    )

    # -----------------------------------------------------
    # MAX TEXT WIDTH
    # -----------------------------------------------------

    dummy_image = Image.new(
        "RGB",
        (1, 1)
    )

    dummy_draw = ImageDraw.Draw(
        dummy_image
    )

    max_text_width = max([
        dummy_draw.textbbox(
            (0, 0),
            text,
            font=load_font(
                int(
                    base_font_sizes[i]
                    * (
                        1
                        - 0.3 * progress
                    )
                )
            ),
            anchor="lt"
        )[2]
        for i, text in enumerate(text_lines)
    ])

    # -----------------------------------------------------
    # START POSITIONS
    # -----------------------------------------------------

    start_positions = [
        (
            540,
            1235
            + i * line_spacing[i]
            - (
                len(text_lines)
                * line_spacing[i]
            ) // 2
        )
        for i in range(
            len(text_lines)
        )
    ]

    # -----------------------------------------------------
    # END POSITIONS
    # -----------------------------------------------------

    end_positions = [
        (
            x_end - max_text_width,
            145
            + i * endline_spacing[i]
        )
        for i in range(
            len(text_lines)
        )
    ]

    # -----------------------------------------------------
    # DRAW EACH LINE
    # -----------------------------------------------------

    for i, text in enumerate(text_lines):

        appearance_frame = (
            start_frame
            + i * frame_interval
        )

        if frame_number < appearance_frame:
            continue

        font_size = int(
            base_font_sizes[i]
            * (
                1
                - 0.35 * progress
            )
        )

        font = load_font(
            font_size
        )

        # Position interpolation
        x = int(
            start_positions[i][0]
            * (1 - progress)
            + end_positions[i][0]
            * progress
        )

        y = int(
            start_positions[i][1]
            * (1 - progress)
            + end_positions[i][1]
            * progress
        )

        # -------------------------------------------------
        # FINAL Y TRANSITION
        # -------------------------------------------------

        if frame_number >= 1327:

            final_progress = np.clip(
                (
                    frame_number - 1327
                )
                / (1342 - 1327),
                0,
                1
            )

            final_progress = 0.5 * (
                1
                - np.cos(
                    np.pi
                    * final_progress
                )
            )

            y = int(
                end_positions[i][1]
                * (1 - final_progress)
                + (
                    start_positions[i][1]
                    - 150
                )
                * final_progress
            )

        # -------------------------------------------------
        # TEXT SIZE
        # -------------------------------------------------

        bbox = draw.textbbox(
            (0, 0),
            text,
            font=font,
            anchor="lt"
        )

        text_width = (
            bbox[2] - bbox[0]
        )

        tc = text_color[i]

        # -------------------------------------------------
        # ALIGNMENT
        # -------------------------------------------------

        center_offset = (
            text_width // 2
        )

        right_offset = (
            max_text_width
            - text_width
        )

        x = (
            x
            - int(
                center_offset
                * (1 - progress)
            )
            + int(
                right_offset
                * progress
            )
        )

        # -------------------------------------------------
        # DRAW
        # -------------------------------------------------

        draw.text(
            (x, y),
            text,
            font=font,
            fill=tc
        )

    return cv2.cvtColor(
        np.array(img_pil),
        cv2.COLOR_RGB2BGR
    )


# =========================================================
# CREATE FINAL VIDEO WITH AUDIO
# =========================================================

def create_video_from_frames(
    output_folder,
    audio_path,
    video_output_path
):

    try:

        # -------------------------------------------------
        # ABSOLUTE PATHS
        # -------------------------------------------------

        output_folder = os.path.abspath(
            output_folder
        )

        audio_path = os.path.abspath(
            audio_path
        )

        video_output_path = os.path.abspath(
            video_output_path
        )

        print(
            "============================================"
        )

        print(
            "Starting final video generation"
        )

        print(
            f"Frames folder: {output_folder}"
        )

        print(
            f"Audio file: {audio_path}"
        )

        print(
            f"Output video: {video_output_path}"
        )

        # -------------------------------------------------
        # VERIFY FRAMES
        # -------------------------------------------------

        if not os.path.isdir(
            output_folder
        ):
            raise Exception(
                f"Processed frames folder does not exist: "
                f"{output_folder}"
            )

        frame_files = [
            file
            for file in os.listdir(
                output_folder
            )
            if file.lower().endswith(".jpg")
        ]

        if not frame_files:
            raise Exception(
                "No processed frames were found."
            )

        print(
            f"Processed frames available: "
            f"{len(frame_files)}"
        )

        # -------------------------------------------------
        # VERIFY AUDIO
        # -------------------------------------------------

        if not os.path.isfile(
            audio_path
        ):
            raise Exception(
                f"Audio file does not exist: "
                f"{audio_path}"
            )

        audio_size = os.path.getsize(
            audio_path
        )

        if audio_size <= 0:
            raise Exception(
                f"Audio file is empty: "
                f"{audio_path}"
            )

        print(
            f"Audio file size: {audio_size} bytes"
        )

        # -------------------------------------------------
        # OUTPUT DIRECTORY
        # -------------------------------------------------

        output_directory = os.path.dirname(
            video_output_path
        )

        if output_directory:
            os.makedirs(
                output_directory,
                exist_ok=True
            )

        # -------------------------------------------------
        # FFMPEG COMMAND
        # -------------------------------------------------

        frame_pattern = os.path.join(
            output_folder,
            "frame_%04d.jpg"
        )

        ffmpeg_command = [
            "ffmpeg",

            # Overwrite
            "-y",

            # -------------------------------------------------
            # VIDEO INPUT
            # -------------------------------------------------

            "-framerate",
            "24",

            "-i",
            frame_pattern,

            # -------------------------------------------------
            # AUDIO INPUT
            # -------------------------------------------------

            "-i",
            audio_path,

            # -------------------------------------------------
            # VIDEO CODEC
            # -------------------------------------------------

            "-c:v",
            "libx264",

            "-pix_fmt",
            "yuv420p",

            # -------------------------------------------------
            # AUDIO CODEC
            # -------------------------------------------------

            "-c:a",
            "aac",

            "-b:a",
            "192k",

            # -------------------------------------------------
            # EXPLICIT STREAM MAPPING
            # -------------------------------------------------

            "-map",
            "0:v:0",

            "-map",
            "1:a:0",

            # -------------------------------------------------
            # FINISH WHEN VIDEO FINISHES
            # -------------------------------------------------

            "-shortest",

            # -------------------------------------------------
            # OUTPUT
            # -------------------------------------------------

            video_output_path
        ]

        print(
            "Running FFmpeg..."
        )

        print(
            "FFmpeg command:"
        )

        print(
            " ".join(
                f'"{arg}"'
                if " " in arg
                else arg
                for arg in ffmpeg_command
            )
        )

        # -------------------------------------------------
        # RUN FFMPEG
        # -------------------------------------------------

        result = subprocess.run(
            ffmpeg_command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            errors="replace",
            check=False
        )

        # Print FFmpeg output
        if result.stdout:
            print(
                result.stdout
            )

        if result.stderr:
            print(
                result.stderr
            )

        # -------------------------------------------------
        # CHECK FFMPEG RESULT
        # -------------------------------------------------

        if result.returncode != 0:

            raise Exception(
                "FFmpeg failed with exit code "
                f"{result.returncode}.\n"
                f"{result.stderr}"
            )

        # -------------------------------------------------
        # VERIFY OUTPUT
        # -------------------------------------------------

        if not os.path.isfile(
            video_output_path
        ):
            raise Exception(
                "FFmpeg finished successfully but "
                "the output video was not created."
            )

        output_size = os.path.getsize(
            video_output_path
        )

        if output_size <= 0:
            raise Exception(
                "Generated video file is empty."
            )

        print(
            "============================================"
        )

        print(
            "VIDEO CREATED SUCCESSFULLY"
        )

        print(
            f"Output: {video_output_path}"
        )

        print(
            f"Size: {output_size} bytes"
        )

        print(
            "Audio was muxed into the MP4."
        )

        print(
            "============================================"
        )

    except Exception as e:

        log_error(
            f"Video creation failed: {e}"
        )

        print(
            f"Video creation failed: {e}"
        )

        raise


# =========================================================
# MAIN
# =========================================================

if __name__ == "__main__":

    temp_folder = None

    try:

        # -------------------------------------------------
        # TEMPLATE ROOT
        # -------------------------------------------------

        template_root = os.path.dirname(
            os.path.abspath(__file__)
        )

        frames_folder = os.path.join(
            template_root,
            "frames"
        )

        print(
            "============================================"
        )

        print(
            "KIDNEY VIDEO GENERATOR"
        )

        print(
            f"Template root: {template_root}"
        )

        print(
            f"Frames folder: {frames_folder}"
        )

        # -------------------------------------------------
        # ARGUMENT PARSER
        # -------------------------------------------------

        parser = argparse.ArgumentParser(
            description=(
                "Replace purple region with input image "
                "and generate video with audio."
            )
        )

        parser.add_argument(
            "overlay_image_path",
            type=str,
            help="Path to the overlay image"
        )

        parser.add_argument(
            "output_video_path",
            type=str,
            help="Path to save the final video"
        )

        parser.add_argument(
            "text1",
            help="Name"
        )

        parser.add_argument(
            "text2",
            help="Speciality"
        )

        parser.add_argument(
            "text3",
            help="Hospital"
        )

        parser.add_argument(
            "text4",
            help="City"
        )

        parser.add_argument(
            "--audio_path",
            required=True,
            help="Path to the audio file"
        )

        args = parser.parse_args()

        # -------------------------------------------------
        # NORMALIZE PATHS
        # -------------------------------------------------

        input_image_path = os.path.abspath(
            args.overlay_image_path
        )

        output_video_path = os.path.abspath(
            args.output_video_path
        )

        audio_path = os.path.abspath(
            args.audio_path
        )

        # -------------------------------------------------
        # PRINT INPUTS
        # -------------------------------------------------

        print(
            f"Input image: {input_image_path}"
        )

        print(
            f"Output video: {output_video_path}"
        )

        print(
            f"Audio: {audio_path}"
        )

        # -------------------------------------------------
        # VERIFY INPUT IMAGE
        # -------------------------------------------------

        if not os.path.isfile(
            input_image_path
        ):
            raise Exception(
                f"Input image does not exist: "
                f"{input_image_path}"
            )

        # -------------------------------------------------
        # VERIFY FRAMES
        # -------------------------------------------------

        if not os.path.isdir(
            frames_folder
        ):
            raise Exception(
                f"Frames folder does not exist: "
                f"{frames_folder}"
            )

        # -------------------------------------------------
        # VERIFY AUDIO
        # -------------------------------------------------

        if not os.path.isfile(
            audio_path
        ):
            raise Exception(
                f"Audio file does not exist: "
                f"{audio_path}"
            )

        audio_size = os.path.getsize(
            audio_path
        )

        print(
            f"Audio size: {audio_size} bytes"
        )

        # -------------------------------------------------
        # VERIFY FFMPEG
        # -------------------------------------------------

        print(
            "Checking FFmpeg..."
        )

        ffmpeg_check = subprocess.run(
            [
                "ffmpeg",
                "-version"
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            errors="replace",
            check=False
        )

        if ffmpeg_check.returncode != 0:
            raise Exception(
                "FFmpeg is not available."
            )

        print(
            "FFmpeg detected successfully."
        )

        # -------------------------------------------------
        # CREATE ABSOLUTE TEMP DIRECTORY
        # -------------------------------------------------

        temp_folder = os.path.join(
            template_root,
            f"processed_frames_{uuid.uuid1()}"
        )

        os.makedirs(
            temp_folder,
            exist_ok=True
        )

        print(
            f"Temporary frame folder: "
            f"{temp_folder}"
        )

        # -------------------------------------------------
        # PROCESS FRAMES
        # -------------------------------------------------

        print(
            "Starting frame processing..."
        )

        process_frames(
            input_image_path,
            frames_folder,
            temp_folder,
            args.text1,
            args.text2,
            args.text3,
            args.text4
        )

        print(
            "Frame processing completed."
        )

        # -------------------------------------------------
        # VERIFY PROCESSED FRAMES
        # -------------------------------------------------

        generated_frames = [
            file
            for file in os.listdir(
                temp_folder
            )
            if file.lower().endswith(".jpg")
        ]

        print(
            f"Generated frames: "
            f"{len(generated_frames)}"
        )

        if not generated_frames:
            raise Exception(
                "No processed frames were generated."
            )

        # -------------------------------------------------
        # CREATE FINAL VIDEO
        # -------------------------------------------------

        print(
            "Starting final video creation..."
        )

        create_video_from_frames(
            temp_folder,
            audio_path,
            output_video_path
        )

        # -------------------------------------------------
        # FINAL CHECK
        # -------------------------------------------------

        if not os.path.isfile(
            output_video_path
        ):
            raise Exception(
                "Final video was not created."
            )

        final_size = os.path.getsize(
            output_video_path
        )
        if final_size <= 0:
            raise Exception(
                "Final video is empty."
            )
        print(
            "============================================"
        )
        print(
            "KIDNEY VIDEO GENERATION COMPLETE"
        )
        print(
            f"Final video: {output_video_path}"
        )
        print(
            f"Final size: {final_size} bytes"
        )
        print(
            "Audio included: YES"
        )
        print(
            "============================================"
        )
    except Exception as e:
        log_error(
            f"Unexpected Error: {e}"
        )
        print(
            "============================================"
        )
        print(
            f"GENERATION FAILED: {e}"
        )
        print(
            "============================================"
        )
        sys.exit(1)
    finally:
        if temp_folder:
            clean_up_temp_folder(
                temp_folder
            )
        gc.collect()
        print(
            "Cleanup completed."
        )