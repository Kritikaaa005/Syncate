from django.core.management.base import BaseCommand
from django.db import transaction

from articles.models import (
    ContentType,
    EducationalContent,
    EducationalContentType,
)


CYCLE_PHASE_ARTICLES = [
    {
        "title": "Understanding the Menstrual Phase",
        "slug": "understanding-the-menstrual-phase",
        "phase": "menstrual",
        "short_description": (
            "Learn what happens during your period and why your cycle begins "
            "with the menstrual phase."
        ),
        "content": """
The menstrual phase is the part of your cycle commonly called your period. Day 1 of bleeding is also counted as Day 1 of a new menstrual cycle.

During this phase, estrogen and progesterone levels are low. The lining of the uterus, which developed during the previous cycle, begins to break down and leave the body as menstrual bleeding.

You may experience changes such as cramps, tiredness, lower-back discomfort, headaches, bloating, or mood changes. Experiences vary from person to person and may also differ between cycles.

Gentle movement, rest, hydration, regular meals, and suitable pain relief may help you feel more comfortable. Seek professional medical advice when pain or bleeding is severe, unusual, or interfering with everyday life.

Syncate estimates your phase from the period dates you record. It cannot confirm what is happening hormonally inside your body.
""".strip(),
    },
    {
        "title": "Understanding the Follicular Phase",
        "slug": "understanding-the-follicular-phase",
        "phase": "follicular",
        "short_description": (
            "Understand how your body prepares an egg and rebuilds the "
            "uterine lining before ovulation."
        ),
        "content": """
The follicular phase begins on the first day of your period and continues until ovulation.

During this phase, follicle-stimulating hormone supports the development of follicles in the ovaries. A follicle contains an immature egg, and usually one becomes dominant as the cycle progresses.

Estrogen generally rises during the follicular phase. This helps rebuild and thicken the lining of the uterus after menstruation.

Some people notice changes in energy, mood, or vaginal discharge as ovulation approaches, while others notice very little. These signs are different for everyone and should not be treated as definite proof of ovulation.

The length of the follicular phase can vary between people and between cycles. Syncate estimates this phase from your recorded cycle dates rather than from hormone tests or medical examinations.
""".strip(),
    },
    {
        "title": "Understanding Ovulation",
        "slug": "understanding-ovulation",
        "phase": "ovulation",
        "short_description": (
            "Learn what ovulation means, when it may happen, and why its "
            "timing can vary."
        ),
        "content": """
Ovulation is the stage of the menstrual cycle when an ovary releases an egg.

A rise in luteinizing hormone helps trigger the release. The egg then moves into a fallopian tube, where fertilization may occur if sperm are present.

Ovulation does not always happen on Day 14. Its timing depends on the length and regularity of your cycle and can change because of stress, illness, travel, hormonal conditions, age, and other factors.

Pregnancy is most likely from sex without contraception during the days leading up to and around ovulation. However, an app prediction cannot confirm ovulation and should not be used as birth control.

Syncate provides an estimated ovulation date using the cycle information you record. The estimate may change when you add new period dates.
""".strip(),
    },
    {
        "title": "Understanding the Luteal Phase",
        "slug": "understanding-the-luteal-phase",
        "phase": "luteal",
        "short_description": (
            "Learn what happens after ovulation while your body prepares for "
            "either pregnancy or the next period."
        ),
        "content": """
The luteal phase begins after ovulation and ends when your next period starts.

After an egg is released, the follicle that released it changes into a temporary structure called the corpus luteum. It produces progesterone, which helps maintain the uterine lining in preparation for a possible pregnancy.

If pregnancy does not occur, estrogen and progesterone levels fall. This hormonal change leads to the beginning of the next menstrual period.

Some people experience premenstrual symptoms during the luteal phase. These can include breast tenderness, bloating, tiredness, food cravings, headaches, irritability, or mood changes. Symptoms and their intensity vary widely.

Syncate estimates the luteal phase from your cycle dates. It does not diagnose premenstrual syndrome, pregnancy, hormonal conditions, or other health concerns.
""".strip(),
    },
]


class Command(BaseCommand):
    help = (
        "Creates or updates the four featured educational articles "
        "for menstrual-cycle phases."
    )

    @transaction.atomic
    def handle(self, *args, **options):
        content_type, _ = ContentType.objects.get_or_create(
            name="Cycle Phases",
            defaults={
                "description": (
                    "Educational articles explaining the phases "
                    "of the menstrual cycle."
                ),
                "is_active": True,
            },
        )

        if not content_type.is_active:
            content_type.is_active = True
            content_type.save(
                update_fields=[
                    "is_active",
                    "updated_at",
                ]
            )

        created_count = 0
        updated_count = 0

        for article_data in CYCLE_PHASE_ARTICLES:
            article, created = (
                EducationalContent.objects.update_or_create(
                    slug=article_data["slug"],
                    defaults={
                        "title": article_data["title"],
                        "short_description": article_data[
                            "short_description"
                        ],
                        "content": article_data["content"],
                        "author": "Syncate Team",
                        "phase": article_data["phase"],
                        "is_published": True,
                        "is_deleted": False,
                    },
                )
            )

            EducationalContentType.objects.get_or_create(
                content=article,
                content_type=content_type,
            )

            if created:
                created_count += 1
                action = "Created"
            else:
                updated_count += 1
                action = "Updated"

            self.stdout.write(
                f"{action}: {article.title}"
            )

        self.stdout.write(
            self.style.SUCCESS(
                (
                    "Cycle-phase articles are ready. "
                    f"Created: {created_count}, "
                    f"Updated: {updated_count}."
                )
            )
        )