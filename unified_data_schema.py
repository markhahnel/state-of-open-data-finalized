"""
Unified Data Schema for State of Open Data Survey Analysis (2017-2024)

This module defines a standardized schema for mapping survey questions across years
and provides utilities for data harmonization and analysis.
"""

from dataclasses import dataclass
from typing import Dict, List, Optional, Union
from enum import Enum

class QuestionType(Enum):
    """Types of survey questions"""
    LIKERT_5 = "likert_5"  # 5-point Likert scale
    LIKERT_4 = "likert_4"  # 4-point Likert scale
    LIKERT_3 = "likert_3"  # 3-point Likert scale
    MULTIPLE_CHOICE = "multiple_choice"
    MULTIPLE_SELECT = "multiple_select"
    OPEN_TEXT = "open_text"
    DEMOGRAPHIC = "demographic"
    BINARY = "binary"  # Yes/No questions

class ResponseScale(Enum):
    """Standard response scales"""
    AGREEMENT_5 = ["Strongly disagree", "Somewhat disagree", "Neutral", "Somewhat agree", "Strongly agree"]
    AGREEMENT_5_ALT = ["Strongly disagree", "Somewhat disagree", "Neutral / No opinion", "Somewhat agree", "Strongly agree"]
    FREQUENCY_4 = ["Never", "Rarely", "Sometimes", "Frequently"]
    FREQUENCY_4_ALT = ["Never", "Rarely", "Often", "Always"]
    YES_NO_UNSURE = ["Yes", "No", "Unsure"]
    YES_NO_DONT_KNOW = ["Yes", "No", "Don't know"]
    CREDIT_3 = ["No, too little credit", "Yes", "No, too much credit"]
    FAMILIARITY_3 = ["I am familiar with the data principles", 
                      "I have previously heard of the data principles but I am not familiar with them",
                      "I have never heard of the data principles before now"]

@dataclass
class QuestionMapping:
    """Maps a question across survey years"""
    question_id: str
    question_text: str
    question_type: QuestionType
    response_scale: List[str]
    years_available: List[int]
    column_mappings: Dict[int, str]  # year -> column_name
    notes: Optional[str] = None

class UnifiedSchema:
    """Unified schema for State of Open Data surveys"""
    
    def __init__(self):
        self.core_questions = self._define_core_questions()
        self.demographic_questions = self._define_demographic_questions()
        self.supplementary_questions = self._define_supplementary_questions()
        self.historical_questions = self._define_historical_questions()
    
    def _define_core_questions(self) -> Dict[str, QuestionMapping]:
        """Define core questions available across multiple years"""
        return {
            "open_access_attitude": QuestionMapping(
                question_id="open_access_attitude",
                question_text="Making research articles open access should be common scholarly practice",
                question_type=QuestionType.LIKERT_5,
                response_scale=ResponseScale.AGREEMENT_5.value,
                years_available=[2021, 2022, 2023, 2024],
                column_mappings={
                    2021: "Q2.7_1",
                    2022: "Q2.11_1", 
                    2023: "Q2.10.a",
                    2024: "Q12_1"
                },
                notes="Highest consistency across years - core trend indicator"
            ),
            
            "open_data_attitude": QuestionMapping(
                question_id="open_data_attitude",
                question_text="Making research data openly available should be common scholarly practice",
                question_type=QuestionType.LIKERT_5,
                response_scale=ResponseScale.AGREEMENT_5.value,
                years_available=[2021, 2022, 2023, 2024],
                column_mappings={
                    2021: "Q2.7_2",
                    2022: "Q2.11_2",
                    2023: "Q2.10.b", 
                    2024: "Q12_2"
                },
                notes="Core data sharing attitude - primary outcome measure"
            ),
            
            "open_peer_review_attitude": QuestionMapping(
                question_id="open_peer_review_attitude",
                question_text="Making peer review open should be common scholarly practice",
                question_type=QuestionType.LIKERT_5,
                response_scale=ResponseScale.AGREEMENT_5.value,
                years_available=[2022, 2023, 2024],
                column_mappings={
                    2022: "Q2.11_3",
                    2023: "Q2.10.c",
                    2024: "Q12_3"
                },
                notes="Introduced in 2022 - good trend indicator"
            ),
            
            "preprinting_attitude": QuestionMapping(
                question_id="preprinting_attitude", 
                question_text="Preprinting should be common scholarly practice",
                question_type=QuestionType.LIKERT_5,
                response_scale=ResponseScale.AGREEMENT_5.value,
                years_available=[2022, 2023, 2024],
                column_mappings={
                    2022: "Q2.11_4",
                    2023: "Q2.10.d",
                    2024: "Q12_4"
                },
                notes="Introduced in 2022 - tracks preprint adoption attitudes"
            ),
            
            "data_sharing_frequency": QuestionMapping(
                question_id="data_sharing_frequency",
                question_text="How often have you made your research data openly available?",
                question_type=QuestionType.LIKERT_4,
                response_scale=ResponseScale.FREQUENCY_4.value,
                years_available=[2017],
                column_mappings={
                    2017: "Q2.2"
                },
                notes="Core behavioral measure - need to map similar questions in other years"
            ),
            
            "credit_for_sharing": QuestionMapping(
                question_id="credit_for_sharing",
                question_text="Do you think researchers currently get sufficient credit for sharing data?",
                question_type=QuestionType.MULTIPLE_CHOICE,
                response_scale=ResponseScale.CREDIT_3.value,
                years_available=[2019, 2022],
                column_mappings={
                    2019: "Q2.4",
                    2022: "Q3.2"
                },
                notes="Important motivational factor"
            ),
            
            "fair_principles_awareness": QuestionMapping(
                question_id="fair_principles_awareness",
                question_text="How familiar are you with FAIR data principles (Findable, Accessible, Interoperable, Reusable)?",
                question_type=QuestionType.MULTIPLE_CHOICE,
                response_scale=ResponseScale.FAMILIARITY_3.value,
                years_available=[2022, 2023],
                column_mappings={
                    2022: "Q3.1_1",
                    2023: "Q2.11.a"
                },
                notes="Key knowledge indicator for data management"
            )
        }
    
    def _define_demographic_questions(self) -> Dict[str, QuestionMapping]:
        """Define demographic questions across years"""
        return {
            "job_title": QuestionMapping(
                question_id="job_title",
                question_text="Which of the following job titles best applies to you?",
                question_type=QuestionType.MULTIPLE_CHOICE,
                response_scale=["Professor", "Associate Professor", "Research Scientist", "PhD Student", "Postdoc", "Other"],
                years_available=[2017, 2019, 2022, 2023, 2024],
                column_mappings={
                    2017: "Q10.5",
                    2019: "Q6.5",
                    2022: "Q2.6",
                    2023: "Q2.6",
                    2024: "Q7"
                },
                notes="Response categories vary by year but can be harmonized"
            ),
            
            "research_area": QuestionMapping(
                question_id="research_area",
                question_text="Which of the following best describes your primary area of interest?",
                question_type=QuestionType.MULTIPLE_CHOICE,
                response_scale=["Medicine", "Engineering", "Physics", "Biology", "Other"],
                years_available=[2021, 2022, 2023, 2024],
                column_mappings={
                    2021: "Q2.4",
                    2022: "Q2.7",
                    2023: "Q2.7",
                    2024: "Q8"
                },
                notes="Consistent categories with some variation"
            ),
            
            "publication_history": QuestionMapping(
                question_id="publication_history",
                question_text="When was the last occasion that you published or submitted a manuscript to a journal?",
                question_type=QuestionType.MULTIPLE_CHOICE,
                response_scale=["Within the last year", "1-2 years ago", "3-5 years ago", "More than 5 years ago", "Never"],
                years_available=[2021, 2022, 2023, 2024],
                column_mappings={
                    2021: "Q2.1",
                    2022: "Q2.3",
                    2023: "Q2.1",
                    2024: "Q4"
                },
                notes="Good indicator of research activity level"
            ),
            
            "organization_type": QuestionMapping(
                question_id="organization_type",
                question_text="Which type of organisation do you work in?",
                question_type=QuestionType.MULTIPLE_CHOICE,
                response_scale=["University", "Research institution", "Medical school", "Private company", "Other"],
                years_available=[2022, 2023, 2024],
                column_mappings={
                    2022: "Q2.4",
                    2023: "Q2.4",
                    2024: "Q5"
                },
                notes="Institutional context indicator"
            )
        }
    
    def _define_supplementary_questions(self) -> Dict[str, QuestionMapping]:
        """Define supplementary questions of interest"""
        return {
            "funder_mandate_support": QuestionMapping(
                question_id="funder_mandate_support",
                question_text="Should funders make the sharing of research data part of their requirements for awarding grants?",
                question_type=QuestionType.LIKERT_3,
                response_scale=ResponseScale.YES_NO_DONT_KNOW.value,
                years_available=[2019],
                column_mappings={2019: "Q2.2"},
                notes="Important policy question - 2019 focus"
            ),
            
            "national_mandate_support": QuestionMapping(
                question_id="national_mandate_support",
                question_text="How supportive would you be of a national mandate for making primary research data openly available?",
                question_type=QuestionType.LIKERT_5,
                response_scale=["Strongly oppose", "Somewhat oppose", "Neutral", "Somewhat support", "Strongly support"],
                years_available=[2019],
                column_mappings={2019: "Q2.3"},
                notes="Policy attitude indicator"
            ),
            
            "care_principles_awareness": QuestionMapping(
                question_id="care_principles_awareness",
                question_text="How familiar are you with CARE principles for Indigenous Data Governance?",
                question_type=QuestionType.MULTIPLE_CHOICE,
                response_scale=ResponseScale.FAMILIARITY_3.value,
                years_available=[2022],
                column_mappings={2022: "Q3.1_2"},
                notes="Ethical data governance awareness"
            )
        }
    
    def _define_historical_questions(self) -> Dict[str, QuestionMapping]:
        """Define questions with rich historical data (mainly 2017)"""
        return {
            "data_sharing_motivations": QuestionMapping(
                question_id="data_sharing_motivations",
                question_text="What circumstances would motivate you to share your data?",
                question_type=QuestionType.MULTIPLE_SELECT,
                response_scale=["Institution requirement", "Funder requirement", "Transparency", "Credit", "Other"],
                years_available=[2017],
                column_mappings={2017: "Q2.3_*"},
                notes="Comprehensive motivation analysis - 2017 baseline"
            ),
            
            "data_sharing_effort": QuestionMapping(
                question_id="data_sharing_effort",
                question_text="How much effort is typically required to make your data re-usable by others?",
                question_type=QuestionType.LIKERT_4,
                response_scale=["No effort", "Little effort", "Some effort", "A lot of effort"],
                years_available=[2017],
                column_mappings={2017: "Q2.5"},
                notes="Barrier assessment - effort required"
            ),
            
            "data_ownership_before_pub": QuestionMapping(
                question_id="data_ownership_before_pub",
                question_text="Who owns the data you produce during the course of your research before publication?",
                question_type=QuestionType.MULTIPLE_SELECT,
                response_scale=["You", "Your institution", "Your funder", "Other"],
                years_available=[2017],
                column_mappings={2017: "Q2.6_*"},
                notes="Ownership understanding - pre-publication"
            ),
            
            "data_ownership_after_pub": QuestionMapping(
                question_id="data_ownership_after_pub",
                question_text="Who owns the data you produce during the course of your research after publication?",
                question_type=QuestionType.MULTIPLE_SELECT,
                response_scale=["You", "Your institution", "Your funder", "Other"],
                years_available=[2017],
                column_mappings={2017: "Q2.7_*"},
                notes="Ownership understanding - post-publication"
            )
        }
    
    def get_all_questions(self) -> Dict[str, QuestionMapping]:
        """Get all questions across all categories"""
        all_questions = {}
        all_questions.update(self.core_questions)
        all_questions.update(self.demographic_questions)
        all_questions.update(self.supplementary_questions)
        all_questions.update(self.historical_questions)
        return all_questions
    
    def get_questions_by_year(self, year: int) -> Dict[str, QuestionMapping]:
        """Get all questions available for a specific year"""
        return {qid: q for qid, q in self.get_all_questions().items() 
                if year in q.years_available}
    
    def get_longitudinal_questions(self, min_years: int = 2) -> Dict[str, QuestionMapping]:
        """Get questions available across multiple years for trend analysis"""
        return {qid: q for qid, q in self.get_all_questions().items() 
                if len(q.years_available) >= min_years}
    
    def get_core_trend_questions(self) -> Dict[str, QuestionMapping]:
        """Get the most reliable questions for longitudinal trend analysis"""
        return {
            qid: q for qid, q in self.core_questions.items() 
            if len(q.years_available) >= 3
        }


# Utility functions for data harmonization
def harmonize_response_scale(response: str, source_scale: List[str], target_scale: List[str]) -> str:
    """Map response from source scale to target scale"""
    if response in source_scale:
        idx = source_scale.index(response)
        if idx < len(target_scale):
            return target_scale[idx]
    return response

def create_harmonized_column_mapping() -> Dict[str, Dict[int, str]]:
    """Create a mapping of harmonized column names to original column names by year"""
    schema = UnifiedSchema()
    
    mapping = {}
    for qid, question in schema.get_all_questions().items():
        mapping[qid] = question.column_mappings
    
    return mapping

# Example usage
if __name__ == "__main__":
    schema = UnifiedSchema()
    
    # Get core trend questions
    core_questions = schema.get_core_trend_questions()
    print("Core trend questions (3+ years):")
    for qid, q in core_questions.items():
        print(f"  {qid}: {len(q.years_available)} years ({q.years_available})")
    
    # Get 2024 questions
    questions_2024 = schema.get_questions_by_year(2024)
    print(f"\n2024 questions available: {len(questions_2024)}")
    
    # Get longitudinal questions
    longitudinal = schema.get_longitudinal_questions()
    print(f"\nLongitudinal questions (2+ years): {len(longitudinal)}")