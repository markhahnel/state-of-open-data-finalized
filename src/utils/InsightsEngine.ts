import type { AttitudeTrend, ChartFilters } from '../types/chart-types';

export interface Insight {
  id: string;
  type: 'trend' | 'anomaly' | 'correlation' | 'prediction' | 'benchmark';
  category: 'motivations' | 'barriers' | 'fair' | 'practices' | 'policy' | 'demographics';
  title: string;
  description: string;
  confidence: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timeframe: 'immediate' | 'short_term' | 'long_term';
  data: any;
  recommendations: string[];
  source: string;
  relatedMetrics: string[];
}

export interface CorrelationResult {
  factor1: string;
  factor2: string;
  correlation: number;
  pValue: number;
  significance: 'high' | 'medium' | 'low';
  interpretation: string;
}

export interface TrendAnalysis {
  metric: string;
  direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  velocity: number;
  acceleration: number;
  seasonality: boolean;
  changePoints: number[];
  forecast: { year: number; value: number; confidence: number }[];
}

export interface AnomalyDetection {
  metric: string;
  year: number;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: 'minor' | 'moderate' | 'major';
  explanation: string;
}

export class InsightsEngine {
  private static instance: InsightsEngine;
  private insights: Insight[] = [];
  private lastAnalysis: Date | null = null;

  static getInstance(): InsightsEngine {
    if (!InsightsEngine.instance) {
      InsightsEngine.instance = new InsightsEngine();
    }
    return InsightsEngine.instance;
  }

  /**
   * Generate comprehensive insights from survey data
   */
  generateInsights(
    data: AttitudeTrend[],
    filters: ChartFilters,
    forceRefresh: boolean = false
  ): Insight[] {
    // Only regenerate if data is stale or force refresh
    if (!forceRefresh && this.lastAnalysis && 
        Date.now() - this.lastAnalysis.getTime() < 300000) { // 5 minutes cache
      return this.insights;
    }

    this.insights = [];
    
    // Trend analysis insights
    this.insights.push(...this.analyzeTrends(data));
    
    // Correlation insights
    this.insights.push(...this.analyzeCorrelations(data));
    
    // Anomaly detection insights
    this.insights.push(...this.detectAnomalies(data));
    
    // Benchmark insights
    this.insights.push(...this.analyzeBenchmarks(data));
    
    // Predictive insights
    this.insights.push(...this.generatePredictions(data));

    // Filter and rank insights
    this.insights = this.rankInsights(this.insights);
    
    this.lastAnalysis = new Date();
    return this.insights;
  }

  /**
   * Analyze trends in the data
   */
  private analyzeTrends(data: AttitudeTrend[]): Insight[] {
    const insights: Insight[] = [];
    
    if (data.length < 3) return insights;

    // Analyze each metric for trends
    const metrics = Object.keys(data[0]).filter(key => key !== 'year');
    
    metrics.forEach(metric => {
      const values = data.map(d => d[metric as keyof AttitudeTrend] as number).filter(v => v !== undefined);
      if (values.length < 3) return;

      const trendAnalysis = this.calculateTrend(values, data.map(d => d.year));
      
      // Significant positive trend
      if (trendAnalysis.velocity > 0.15 && trendAnalysis.direction === 'increasing') {
        insights.push({
          id: `trend-positive-${metric}`,
          type: 'trend',
          category: this.categorizeMetric(metric),
          title: `${this.formatMetricName(metric)} Shows Strong Growth`,
          description: `${this.formatMetricName(metric)} has increased by ${(trendAnalysis.velocity * 100).toFixed(1)}% annually with ${trendAnalysis.acceleration > 0 ? 'accelerating' : 'steady'} momentum.`,
          confidence: this.calculateConfidence(trendAnalysis, values),
          severity: trendAnalysis.velocity > 0.25 ? 'high' : 'medium',
          timeframe: trendAnalysis.acceleration > 0.05 ? 'immediate' : 'short_term',
          data: { trend: trendAnalysis, values, years: data.map(d => d.year) },
          recommendations: this.generateTrendRecommendations(metric, trendAnalysis, 'positive'),
          source: 'Trend Analysis Engine',
          relatedMetrics: this.findRelatedMetrics(metric, metrics)
        });
      }

      // Significant negative trend (concerning)
      if (trendAnalysis.velocity < -0.1 && trendAnalysis.direction === 'decreasing') {
        insights.push({
          id: `trend-negative-${metric}`,
          type: 'trend',
          category: this.categorizeMetric(metric),
          title: `${this.formatMetricName(metric)} Declining`,
          description: `${this.formatMetricName(metric)} has decreased by ${Math.abs(trendAnalysis.velocity * 100).toFixed(1)}% annually, requiring attention.`,
          confidence: this.calculateConfidence(trendAnalysis, values),
          severity: Math.abs(trendAnalysis.velocity) > 0.2 ? 'critical' : 'high',
          timeframe: 'immediate',
          data: { trend: trendAnalysis, values, years: data.map(d => d.year) },
          recommendations: this.generateTrendRecommendations(metric, trendAnalysis, 'negative'),
          source: 'Trend Analysis Engine',
          relatedMetrics: this.findRelatedMetrics(metric, metrics)
        });
      }

      // Acceleration/deceleration insights
      if (Math.abs(trendAnalysis.acceleration) > 0.1) {
        const accelerating = trendAnalysis.acceleration > 0;
        insights.push({
          id: `acceleration-${metric}`,
          type: 'trend',
          category: this.categorizeMetric(metric),
          title: `${this.formatMetricName(metric)} ${accelerating ? 'Accelerating' : 'Decelerating'}`,
          description: `The rate of change in ${this.formatMetricName(metric)} is ${accelerating ? 'accelerating' : 'decelerating'}, indicating a shift in underlying dynamics.`,
          confidence: 75,
          severity: 'medium',
          timeframe: 'short_term',
          data: { trend: trendAnalysis, acceleration: trendAnalysis.acceleration },
          recommendations: this.generateAccelerationRecommendations(metric, accelerating),
          source: 'Trend Analysis Engine',
          relatedMetrics: []
        });
      }
    });

    return insights;
  }

  /**
   * Analyze correlations between metrics
   */
  private analyzeCorrelations(data: AttitudeTrend[]): Insight[] {
    const insights: Insight[] = [];
    const metrics = Object.keys(data[0]).filter(key => key !== 'year');
    
    // Calculate correlations between all metric pairs
    for (let i = 0; i < metrics.length; i++) {
      for (let j = i + 1; j < metrics.length; j++) {
        const metric1 = metrics[i];
        const metric2 = metrics[j];
        
        const values1 = data.map(d => d[metric1 as keyof AttitudeTrend] as number).filter(v => v !== undefined);
        const values2 = data.map(d => d[metric2 as keyof AttitudeTrend] as number).filter(v => v !== undefined);
        
        if (values1.length !== values2.length || values1.length < 3) continue;
        
        const correlation = this.calculateCorrelation(values1, values2);
        
        // Strong correlations (positive or negative)
        if (Math.abs(correlation.correlation) > 0.7) {
          insights.push({
            id: `correlation-${metric1}-${metric2}`,
            type: 'correlation',
            category: 'demographics',
            title: `Strong ${correlation.correlation > 0 ? 'Positive' : 'Negative'} Correlation Discovered`,
            description: `${this.formatMetricName(metric1)} and ${this.formatMetricName(metric2)} show a strong ${correlation.correlation > 0 ? 'positive' : 'negative'} correlation (r=${correlation.correlation.toFixed(2)}), suggesting ${correlation.interpretation}.`,
            confidence: Math.min(95, 60 + Math.abs(correlation.correlation) * 30),
            severity: Math.abs(correlation.correlation) > 0.8 ? 'high' : 'medium',
            timeframe: 'long_term',
            data: { correlation, metric1, metric2, values1, values2 },
            recommendations: this.generateCorrelationRecommendations(metric1, metric2, correlation),
            source: 'Correlation Analysis Engine',
            relatedMetrics: [metric1, metric2]
          });
        }
      }
    }

    return insights;
  }

  /**
   * Detect anomalies in the data
   */
  private detectAnomalies(data: AttitudeTrend[]): Insight[] {
    const insights: Insight[] = [];
    const metrics = Object.keys(data[0]).filter(key => key !== 'year');
    
    metrics.forEach(metric => {
      const values = data.map(d => d[metric as keyof AttitudeTrend] as number).filter(v => v !== undefined);
      const years = data.map(d => d.year);
      
      if (values.length < 4) return;
      
      const anomalies = this.findAnomalies(values, years);
      
      anomalies.forEach(anomaly => {
        if (anomaly.severity === 'major') {
          insights.push({
            id: `anomaly-${metric}-${anomaly.year}`,
            type: 'anomaly',
            category: this.categorizeMetric(metric),
            title: `Significant Anomaly in ${this.formatMetricName(metric)}`,
            description: `In ${anomaly.year}, ${this.formatMetricName(metric)} showed an unexpected ${anomaly.value > anomaly.expectedValue ? 'spike' : 'drop'} of ${Math.abs(anomaly.deviation).toFixed(1)}% from the expected trend.`,
            confidence: 85,
            severity: 'high',
            timeframe: 'immediate',
            data: { anomaly, metric, years, values },
            recommendations: this.generateAnomalyRecommendations(metric, anomaly),
            source: 'Anomaly Detection Engine',
            relatedMetrics: []
          });
        }
      });
    });

    return insights;
  }

  /**
   * Analyze benchmarks and comparative performance
   */
  private analyzeBenchmarks(data: AttitudeTrend[]): Insight[] {
    const insights: Insight[] = [];
    
    if (data.length === 0) return insights;
    
    const latestData = data[data.length - 1];
    const firstData = data[0];
    const metrics = Object.keys(latestData).filter(key => key !== 'year');
    
    // Identify top and bottom performers
    const performance = metrics.map(metric => ({
      metric,
      current: latestData[metric as keyof AttitudeTrend] as number,
      growth: ((latestData[metric as keyof AttitudeTrend] as number) - (firstData[metric as keyof AttitudeTrend] as number)),
      category: this.categorizeMetric(metric)
    })).filter(p => p.current !== undefined && p.growth !== undefined);
    
    // Top performer
    const topPerformer = performance.reduce((max, current) => 
      current.growth > max.growth ? current : max
    );
    
    if (topPerformer.growth > 0.5) {
      insights.push({
        id: `benchmark-top-${topPerformer.metric}`,
        type: 'benchmark',
        category: topPerformer.category as any,
        title: `${this.formatMetricName(topPerformer.metric)} Leads Performance`,
        description: `${this.formatMetricName(topPerformer.metric)} shows the strongest improvement with ${(topPerformer.growth * 20).toFixed(0)}% growth since 2017, setting a benchmark for other metrics.`,
        confidence: 90,
        severity: 'high',
        timeframe: 'long_term',
        data: { performance: topPerformer, allMetrics: performance },
        recommendations: [
          `Analyze success factors driving ${this.formatMetricName(topPerformer.metric)} growth`,
          'Apply successful strategies to underperforming areas',
          'Share best practices across similar contexts',
          'Establish this metric as a model for others'
        ],
        source: 'Benchmark Analysis Engine',
        relatedMetrics: [topPerformer.metric]
      });
    }

    // Underperformer
    const underperformer = performance.reduce((min, current) => 
      current.growth < min.growth ? current : min
    );
    
    if (underperformer.growth < -0.1) {
      insights.push({
        id: `benchmark-bottom-${underperformer.metric}`,
        type: 'benchmark',
        category: underperformer.category as any,
        title: `${this.formatMetricName(underperformer.metric)} Needs Attention`,
        description: `${this.formatMetricName(underperformer.metric)} shows concerning performance with ${(Math.abs(underperformer.growth) * 20).toFixed(0)}% decline, requiring targeted intervention.`,
        confidence: 85,
        severity: 'critical',
        timeframe: 'immediate',
        data: { performance: underperformer, allMetrics: performance },
        recommendations: [
          `Investigate root causes of ${this.formatMetricName(underperformer.metric)} decline`,
          'Develop targeted improvement strategies',
          'Benchmark against successful similar metrics',
          'Implement monitoring and intervention protocols'
        ],
        source: 'Benchmark Analysis Engine',
        relatedMetrics: [underperformer.metric]
      });
    }

    return insights;
  }

  /**
   * Generate predictive insights
   */
  private generatePredictions(data: AttitudeTrend[]): Insight[] {
    const insights: Insight[] = [];
    
    if (data.length < 4) return insights;
    
    const metrics = Object.keys(data[0]).filter(key => key !== 'year');
    
    metrics.forEach(metric => {
      const values = data.map(d => d[metric as keyof AttitudeTrend] as number).filter(v => v !== undefined);
      const years = data.map(d => d.year);
      
      if (values.length < 4) return;
      
      const forecast = this.generateForecast(values, years);
      
      // Significant predicted changes
      if (Math.abs(forecast.predictedChange) > 0.2) {
        const direction = forecast.predictedChange > 0 ? 'increase' : 'decrease';
        insights.push({
          id: `prediction-${metric}`,
          type: 'prediction',
          category: this.categorizeMetric(metric),
          title: `${this.formatMetricName(metric)} Predicted to ${direction === 'increase' ? 'Rise' : 'Fall'}`,
          description: `Based on current trends, ${this.formatMetricName(metric)} is predicted to ${direction} by ${Math.abs(forecast.predictedChange * 20).toFixed(0)}% by 2026.`,
          confidence: forecast.confidence,
          severity: Math.abs(forecast.predictedChange) > 0.3 ? 'high' : 'medium',
          timeframe: 'long_term',
          data: { forecast, metric, currentValue: values[values.length - 1] },
          recommendations: this.generatePredictionRecommendations(metric, forecast),
          source: 'Prediction Engine',
          relatedMetrics: []
        });
      }
    });

    return insights;
  }

  /**
   * Utility methods for calculations
   */
  private calculateTrend(values: number[], years: number[]): TrendAnalysis {
    const n = values.length;
    const sumX = years.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = years.reduce((sum, x, i) => sum + x * values[i], 0);
    const sumX2 = years.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const velocity = slope / (sumY / n); // Normalized velocity
    
    // Calculate acceleration (second derivative)
    const midPoint = Math.floor(n / 2);
    const firstHalf = values.slice(0, midPoint);
    const secondHalf = values.slice(midPoint);
    const firstSlope = this.calculateSlope(firstHalf, years.slice(0, midPoint));
    const secondSlope = this.calculateSlope(secondHalf, years.slice(midPoint));
    const acceleration = secondSlope - firstSlope;
    
    let direction: TrendAnalysis['direction'];
    if (Math.abs(velocity) < 0.02) direction = 'stable';
    else if (velocity > 0) direction = 'increasing';
    else direction = 'decreasing';
    
    return {
      metric: '',
      direction,
      velocity,
      acceleration,
      seasonality: false, // Simplified - could implement seasonal detection
      changePoints: [],
      forecast: [] // Could implement forecasting here
    };
  }

  private calculateSlope(values: number[], years: number[]): number {
    const n = values.length;
    if (n < 2) return 0;
    
    const sumX = years.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = years.reduce((sum, x, i) => sum + x * values[i], 0);
    const sumX2 = years.reduce((sum, x) => sum + x * x, 0);
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  private calculateCorrelation(values1: number[], values2: number[]): CorrelationResult {
    const n = values1.length;
    const sum1 = values1.reduce((a, b) => a + b, 0);
    const sum2 = values2.reduce((a, b) => a + b, 0);
    const sum1Sq = values1.reduce((sum, val) => sum + val * val, 0);
    const sum2Sq = values2.reduce((sum, val) => sum + val * val, 0);
    const sum12 = values1.reduce((sum, val, i) => sum + val * values2[i], 0);
    
    const numerator = n * sum12 - sum1 * sum2;
    const denominator = Math.sqrt((n * sum1Sq - sum1 * sum1) * (n * sum2Sq - sum2 * sum2));
    
    const correlation = denominator === 0 ? 0 : numerator / denominator;
    
    // Simplified p-value calculation
    const tStat = correlation * Math.sqrt((n - 2) / (1 - correlation * correlation));
    const pValue = 2 * (1 - this.tDistCDF(Math.abs(tStat), n - 2));
    
    let significance: 'high' | 'medium' | 'low';
    if (pValue < 0.01) significance = 'high';
    else if (pValue < 0.05) significance = 'medium';
    else significance = 'low';
    
    const interpretation = this.interpretCorrelation(correlation, significance);
    
    return {
      factor1: '',
      factor2: '',
      correlation,
      pValue,
      significance,
      interpretation
    };
  }

  private findAnomalies(values: number[], years: number[]): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    
    // Calculate moving average and standard deviation
    for (let i = 2; i < values.length; i++) {
      const window = values.slice(Math.max(0, i - 2), i);
      const mean = window.reduce((a, b) => a + b, 0) / window.length;
      const std = Math.sqrt(window.reduce((sum, val) => sum + (val - mean) ** 2, 0) / window.length);
      
      const deviation = Math.abs(values[i] - mean) / std;
      
      let severity: AnomalyDetection['severity'];
      if (deviation > 2.5) severity = 'major';
      else if (deviation > 2) severity = 'moderate';
      else if (deviation > 1.5) severity = 'minor';
      else continue;
      
      anomalies.push({
        metric: '',
        year: years[i],
        value: values[i],
        expectedValue: mean,
        deviation: ((values[i] - mean) / mean) * 100,
        severity,
        explanation: `Value deviates ${deviation.toFixed(1)} standard deviations from expected`
      });
    }
    
    return anomalies;
  }

  private generateForecast(values: number[], years: number[]): { predictedChange: number; confidence: number } {
    const trend = this.calculateTrend(values, years);
    const lastValue = values[values.length - 1];
    const yearsToForecast = 2; // Predict 2 years ahead
    
    const predictedValue = lastValue + (trend.velocity * lastValue * yearsToForecast);
    const predictedChange = (predictedValue - lastValue) / lastValue;
    
    // Confidence decreases with volatility and forecast distance
    const volatility = this.calculateVolatility(values);
    const confidence = Math.max(50, 90 - (volatility * 100) - (yearsToForecast * 5));
    
    return { predictedChange, confidence };
  }

  private calculateVolatility(values: number[]): number {
    const changes = [];
    for (let i = 1; i < values.length; i++) {
      changes.push((values[i] - values[i - 1]) / values[i - 1]);
    }
    
    const mean = changes.reduce((a, b) => a + b, 0) / changes.length;
    const variance = changes.reduce((sum, change) => sum + (change - mean) ** 2, 0) / changes.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Utility methods for formatting and categorization
   */
  private categorizeMetric(metric: string): 'motivations' | 'barriers' | 'fair' | 'practices' | 'policy' | 'demographics' {
    if (metric.includes('motivation') || metric.includes('reproducibility') || metric.includes('collaboration')) {
      return 'motivations';
    }
    if (metric.includes('barrier') || metric.includes('time') || metric.includes('privacy')) {
      return 'barriers';
    }
    if (metric.includes('fair') || metric.includes('findable') || metric.includes('accessible')) {
      return 'fair';
    }
    if (metric.includes('practice') || metric.includes('management') || metric.includes('cloud')) {
      return 'practices';
    }
    if (metric.includes('policy') || metric.includes('mandate') || metric.includes('funder')) {
      return 'policy';
    }
    return 'demographics';
  }

  private formatMetricName(metric: string): string {
    return metric
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private calculateConfidence(trend: TrendAnalysis, values: number[]): number {
    const volatility = this.calculateVolatility(values);
    const baseConfidence = 80;
    const volatilityPenalty = volatility * 30;
    const trendStrengthBonus = Math.abs(trend.velocity) * 20;
    
    return Math.max(50, Math.min(95, baseConfidence - volatilityPenalty + trendStrengthBonus));
  }

  private generateTrendRecommendations(metric: string, trend: TrendAnalysis, direction: 'positive' | 'negative'): string[] {
    const base = direction === 'positive' ? [
      `Continue successful strategies driving ${this.formatMetricName(metric)} growth`,
      `Scale effective approaches to other related areas`,
      `Monitor sustainability of current growth rate`
    ] : [
      `Investigate root causes of ${this.formatMetricName(metric)} decline`,
      `Implement immediate intervention strategies`,
      `Benchmark against successful peer initiatives`
    ];
    
    return base;
  }

  private generateCorrelationRecommendations(metric1: string, metric2: string, correlation: CorrelationResult): string[] {
    return [
      `Leverage ${this.formatMetricName(metric1)} insights to improve ${this.formatMetricName(metric2)}`,
      'Develop integrated strategies addressing both metrics',
      'Monitor for changes in correlation over time',
      'Investigate causal mechanisms behind correlation'
    ];
  }

  private generateAnomalyRecommendations(metric: string, anomaly: AnomalyDetection): string[] {
    return [
      `Investigate external factors affecting ${this.formatMetricName(metric)} in ${anomaly.year}`,
      'Determine if anomaly represents a permanent shift or temporary fluctuation',
      'Adjust forecasting models to account for identified anomaly',
      'Implement monitoring for similar future anomalies'
    ];
  }

  private generatePredictionRecommendations(metric: string, forecast: any): string[] {
    return [
      `Prepare strategic responses for predicted ${this.formatMetricName(metric)} changes`,
      'Develop scenario plans for different forecast outcomes',
      'Monitor leading indicators to validate predictions',
      'Adjust resource allocation based on predicted trends'
    ];
  }

  private generateAccelerationRecommendations(metric: string, accelerating: boolean): string[] {
    return accelerating ? [
      `Capitalize on accelerating ${this.formatMetricName(metric)} momentum`,
      'Increase resource allocation to sustain acceleration',
      'Document factors driving acceleration for replication'
    ] : [
      `Address factors causing ${this.formatMetricName(metric)} deceleration`,
      'Implement strategies to re-energize growth',
      'Review and refresh current approaches'
    ];
  }

  private findRelatedMetrics(metric: string, allMetrics: string[]): string[] {
    // Simplified - could implement more sophisticated semantic matching
    return allMetrics.filter(m => m !== metric).slice(0, 3);
  }

  private rankInsights(insights: Insight[]): Insight[] {
    return insights.sort((a, b) => {
      // Primary sort by severity
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      
      // Secondary sort by confidence
      return b.confidence - a.confidence;
    });
  }

  private interpretCorrelation(correlation: number, significance: string): string {
    const strength = Math.abs(correlation) > 0.8 ? 'strong' : 
                    Math.abs(correlation) > 0.6 ? 'moderate' : 'weak';
    const direction = correlation > 0 ? 'positive' : 'negative';
    
    return `${strength} ${direction} relationship with ${significance} statistical significance`;
  }

  private tDistCDF(t: number, df: number): number {
    // Simplified t-distribution CDF approximation
    return 0.5 + 0.5 * Math.sign(t) * Math.sqrt(1 - Math.exp(-2 * t * t / Math.PI));
  }
}

export default InsightsEngine;