# State of Open Data Survey Analysis: Summary and Recommendations

## Executive Summary

This analysis examined 6 years of State of Open Data survey data (2017-2024) to identify common themes, consistent questions, and create a unified data schema for longitudinal trend analysis. The analysis reveals significant evolution in survey design, from comprehensive exploration (2017) to focused monitoring (2024).

## Key Findings

### 1. Survey Evolution Pattern
- **2017**: Most comprehensive (374 columns) - exploration phase
- **2019**: Streamlined (186 columns) - policy focus phase  
- **2021-2022**: Moderate complexity (201-217 columns) - open science integration
- **2023-2024**: Simplified (114-62 columns) - focused monitoring

### 2. Most Consistent Questions for Trend Analysis

**Tier 1: Highest Consistency (4 years: 2021-2024)**
1. **Open Access Attitude**: "Making research articles open access should be common scholarly practice"
2. **Open Data Attitude**: "Making research data openly available should be common scholarly practice"
3. **Job Title**: Demographic classification (harmonizable across 5 years)
4. **Research Area**: Primary field of interest (harmonizable across 4 years)
5. **Publication History**: Recent publication activity (4 years)

**Tier 2: Good Consistency (3 years: 2022-2024)**
1. **Open Peer Review Attitude**: "Making peer review open should be common scholarly practice"
2. **Preprinting Attitude**: "Preprinting should be common scholarly practice"
3. **Organization Type**: Institutional context

**Tier 3: Moderate Consistency (2 years)**
1. **Credit for Data Sharing**: Whether researchers get sufficient credit (2019, 2022)
2. **FAIR Principles Awareness**: Knowledge of FAIR principles (2022, 2023)

### 3. Unique Historical Data (2017)
- Comprehensive motivation analysis (17 specific motivating factors)
- Detailed barrier assessment (effort, ownership, licensing)
- Extensive repository usage patterns
- Granular data management practices

### 4. Policy Focus Period (2019)
- Funder mandate support
- National policy attitudes
- Credit mechanism preferences
- Enforcement attitudes

## Recommendations

### For Longitudinal Trend Analysis

#### Priority 1: Core Trend Questions (Use for primary analysis)
Focus on the **4 open science attitude questions** (2021-2024):
- Open access attitude
- Open data attitude  
- Open peer review attitude
- Preprinting attitude

These provide the most reliable 4-year trends with consistent wording and response scales.

#### Priority 2: Demographic Stratification
Use **harmonized demographic variables**:
- Job title (5 years of data, needs harmonization)
- Research area (4 years, good consistency)
- Publication history (4 years, good consistency)
- Organization type (3 years, recent trend)

#### Priority 3: Key Behavioral Measures
- Data sharing frequency (2017 baseline, find equivalents in other years)
- Credit perceptions (2019, 2022)
- FAIR awareness (2022, 2023)

### For Historical Context Analysis

#### Use 2017 as Comprehensive Baseline
The 2017 survey provides the most detailed snapshot of:
- Data sharing motivations (17 factors)
- Barriers to sharing (effort, ownership, licensing)
- Repository usage patterns
- Institutional support levels

#### Use 2019 for Policy Analysis
The 2019 survey captures a unique moment of policy focus:
- Funder mandate attitudes
- National policy support
- Credit mechanism preferences
- Enforcement attitudes

### For Data Harmonization

#### Response Scale Standardization
Most questions use 5-point Likert scales but with slight variations:
- **Standard**: "Strongly disagree" to "Strongly agree"
- **Variation**: "Neutral" vs "Neutral / No opinion"
- **Recommendation**: Map to standard 5-point scale

#### Demographic Harmonization
**Job Title Categories** (suggested harmonization):
- Professor/Associate Professor → Academic Staff
- Research Scientist → Research Staff  
- PhD Student/Postdoc → Early Career
- Other → Other

**Research Area Categories** (consistent core):
- Medicine, Engineering, Physics, Biology (consistent across years)
- Map other categories to "Other" for trend analysis

### For Missing Data Handling

#### Cross-Year Imputation Strategy
1. **2017**: Extensive skip logic may create systematic missingness
2. **2019**: Text format may have encoding issues (handle carefully)
3. **2021-2024**: More straightforward missing data patterns

#### Recommended Approach
- Complete case analysis for core trend questions (2021-2024)
- Pairwise deletion for demographic stratification
- Sensitivity analysis excluding 2017 if skip logic creates bias

## Implementation Plan

### Phase 1: Core Trend Analysis
1. Extract and harmonize 4 core attitude questions (2021-2024)
2. Create standardized response scales
3. Generate year-over-year trend visualizations
4. Stratify by harmonized demographics

### Phase 2: Extended Analysis
1. Incorporate 2019 policy questions for context
2. Add 2017 baseline for comprehensive measures
3. Develop cross-year comparison tables
4. Create longitudinal models

### Phase 3: Deep Dive Analysis
1. Leverage 2017 comprehensive data for motivation/barrier analysis
2. Examine policy evolution using 2019 data
3. Track knowledge diffusion (FAIR principles 2022-2023)
4. Analyze institutional differences

## Data Quality Considerations

### Strengths
- Core attitude questions highly consistent (2021-2024)
- Demographics reasonably stable across years
- Large sample sizes in most years
- Good coverage of key open science topics

### Limitations
- Major structural changes between years limit some comparisons
- 2017 complexity may introduce systematic bias
- Some response scale variations require careful mapping
- Missing equivalent questions for key behavioral measures

### Recommendations for Future Surveys
1. **Maintain Core Battery**: Keep the 4 core attitude questions unchanged
2. **Stable Demographics**: Maintain consistent demographic categories
3. **Behavioral Measures**: Add consistent data sharing frequency question
4. **Policy Tracking**: Include periodic policy attitude questions
5. **Knowledge Tracking**: Monitor awareness of key principles (FAIR, CARE)

## Conclusion

The State of Open Data survey provides valuable longitudinal data for tracking open science attitudes, with the strongest trend data available from 2021-2024. The 2017 survey offers unique historical depth, while 2019 captures important policy attitudes. The unified schema developed in this analysis enables robust trend analysis while accounting for survey evolution and maintaining data quality standards.

Key deliverables:
- `unified_data_schema.py`: Programmatic schema for data harmonization
- `question_crosswalk_table.csv`: Detailed question mapping across years
- `survey_analysis_report.md`: Comprehensive technical analysis

This analysis provides the foundation for robust longitudinal analysis of open data attitudes and behaviors over a critical period in open science development.