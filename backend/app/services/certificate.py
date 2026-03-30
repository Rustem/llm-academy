"""Generate a PDF certificate of completion."""

import io
from datetime import datetime

from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas


def generate_certificate(
    username: str,
    course_title: str,
    total_xp: int,
    exercises_completed: int,
    level: str,
    completed_date: str | None = None,
) -> bytes:
    """Generate a certificate PDF and return as bytes."""
    buf = io.BytesIO()
    width, height = landscape(A4)
    c = canvas.Canvas(buf, pagesize=landscape(A4))

    # Colors
    bg = HexColor("#0a0e1a")
    accent = HexColor("#0a84ff")
    text_primary = HexColor("#e8edf5")
    text_muted = HexColor("#8b98b0")
    border = HexColor("#1f2937")
    gold = HexColor("#ffd60a")

    # Background
    c.setFillColor(bg)
    c.rect(0, 0, width, height, fill=1)

    # Border frame
    margin = 40
    c.setStrokeColor(border)
    c.setLineWidth(2)
    c.rect(margin, margin, width - 2 * margin, height - 2 * margin)

    # Inner accent border
    c.setStrokeColor(accent)
    c.setLineWidth(0.5)
    c.rect(margin + 8, margin + 8, width - 2 * margin - 16, height - 2 * margin - 16)

    # Header
    c.setFillColor(accent)
    c.setFont("Helvetica", 12)
    c.drawCentredString(width / 2, height - 90, "LLM ACADEMY")

    # Title
    c.setFillColor(gold)
    c.setFont("Helvetica-Bold", 32)
    c.drawCentredString(width / 2, height - 140, "Certificate of Completion")

    # Subtitle
    c.setFillColor(text_muted)
    c.setFont("Helvetica", 13)
    c.drawCentredString(width / 2, height - 170, "This certifies that")

    # Name
    c.setFillColor(text_primary)
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(width / 2, height - 215, username)

    # Course
    c.setFillColor(text_muted)
    c.setFont("Helvetica", 13)
    c.drawCentredString(width / 2, height - 248, "has successfully completed the course")

    c.setFillColor(accent)
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(width / 2, height - 282, course_title)

    # Stats row
    stats_y = height - 340
    c.setFillColor(text_muted)
    c.setFont("Helvetica", 11)
    stats = [
        f"{exercises_completed} Exercises",
        f"{total_xp} XP",
        f"Level: {level}",
    ]
    total_width = len(stats) * 150
    start_x = (width - total_width) / 2 + 75
    for i, stat in enumerate(stats):
        c.drawCentredString(start_x + i * 150, stats_y, stat)

    # Date
    date_str = completed_date or datetime.utcnow().strftime("%B %d, %Y")
    c.setFillColor(text_muted)
    c.setFont("Helvetica", 11)
    c.drawCentredString(width / 2, margin + 50, f"Issued on {date_str}")

    # Footer
    c.setFillColor(HexColor("#5a6b85"))
    c.setFont("Helvetica", 9)
    c.drawCentredString(width / 2, margin + 25, "llm-academy.com · Prompt Engineering for Professionals")

    c.save()
    buf.seek(0)
    return buf.read()
