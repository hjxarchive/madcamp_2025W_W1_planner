import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, G, Text as SvgText } from 'react-native-svg';
import { COLORS, FONT_SIZES, formatTimeShort } from '@constants/index';

interface Task {
  id: string;
  content: string;
  isDone: boolean;
  durationMs: number;
}

interface ReportDonutChartProps {
  tasks: Task[];
  totalTimeMs: number;
  size?: number;
  showLabels?: boolean;
  onSegmentClick?: (task: Task) => void;
}

export const ReportDonutChart: React.FC<ReportDonutChartProps> = ({
  tasks,
  totalTimeMs,
  size = 280,
  showLabels = true,
  onSegmentClick,
}) => {
  const grayColors = ['#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB', '#F3F4F6'];

  // 디버깅: 입력 데이터 확인
  console.log('ReportDonutChart - input tasks:', tasks.length, tasks.map(t => ({ id: t.id, content: t.content, durationMs: t.durationMs })));
  console.log('ReportDonutChart - input totalTimeMs:', totalTimeMs);

  // Task를 올림차순으로 정렬 (content 기준)
  const tasksWithTime = tasks
    .filter(t => t.durationMs > 0)
    .sort((a, b) => a.content.localeCompare(b.content));

  console.log('ReportDonutChart - tasksWithTime after filter:', tasksWithTime.length);

  // 텍스트가 잘리지 않도록 패딩 추가
  const padding = showLabels ? 80 : 20;
  const chartSize = size - padding * 2;
  const innerRadius = chartSize / 2 - 25;
  const outerRadius = chartSize / 2 - 5;
  const centerX = size / 2;
  const centerY = size / 2;

  console.log('ReportDonutChart - chart dimensions:', { padding, chartSize, innerRadius, outerRadius, centerX, centerY });

  if (totalTimeMs === 0 || tasksWithTime.length === 0) {
    console.log('ReportDonutChart - showing empty state because:', totalTimeMs === 0 ? 'totalTimeMs is 0' : 'no tasks with time');
    return (
      <View style={[styles.emptyContainer, { height: size }]}>
        <Text style={styles.emptyText}>시간 기록 없음</Text>
      </View>
    );
  }
  
  // 각 segment의 path를 생성
  let currentAngle = -90; // 시작 각도 (위쪽부터)
  const segments = tasksWithTime.map((task, index) => {
    const percentage = (task.durationMs / totalTimeMs) * 100;
    const angle = (percentage / 100) * 360;
    
    // 시작 및 종료 각도 (도 단위)
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    // 라디안으로 변환
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    // 중심 각도 (텍스트 배치용)
    const midAngleRad = ((startAngle + angle / 2) * Math.PI) / 180;
    
    // 외곽 포인트 계산
    const x1 = centerX + innerRadius * Math.cos(startAngleRad);
    const y1 = centerY + innerRadius * Math.sin(startAngleRad);
    const x2 = centerX + outerRadius * Math.cos(startAngleRad);
    const y2 = centerY + outerRadius * Math.sin(startAngleRad);
    const x3 = centerX + outerRadius * Math.cos(endAngleRad);
    const y3 = centerY + outerRadius * Math.sin(endAngleRad);
    const x4 = centerX + innerRadius * Math.cos(endAngleRad);
    const y4 = centerY + innerRadius * Math.sin(endAngleRad);
    
    // 원호를 위한 큰 원/작은 원 플래그
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    // Path 생성
    const path = [
      `M ${x1} ${y1}`, // 내부 시작점
      `L ${x2} ${y2}`, // 외부 시작점
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}`, // 외부 원호
      `L ${x4} ${y4}`, // 내부 끝점
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}`, // 내부 원호
      'Z'
    ].join(' ');
    
    // 텍스트 위치 계산 (외곽에 배치)
    const textRadius = outerRadius + 15;
    const textX = centerX + textRadius * Math.cos(midAngleRad);
    const textY = centerY + textRadius * Math.sin(midAngleRad);
    
    // 텍스트 정렬 방향 계산
    const textAnchor = textX > centerX ? 'start' : textX < centerX ? 'end' : 'middle';
    
    const segment = {
      task,
      percentage,
      path,
      textX,
      textY,
      textAnchor,
      midAngleRad,
      color: grayColors[index % grayColors.length]
    };
    
    currentAngle += angle;
    return segment;
  });
  
  console.log('ReportDonutChart - rendering segments:', segments.length);
  segments.forEach((seg, i) => {
    console.log(`Segment ${i}: ${seg.task.content}, percentage: ${seg.percentage}%, path length: ${seg.path.length}`);
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((segment) => (
          <G key={segment.task.id}>
            <Path
              d={segment.path}
              fill={segment.color}
              stroke="white"
              strokeWidth={2}
              onPress={() => onSegmentClick && onSegmentClick(segment.task)}
            />
            {showLabels && (
              <SvgText
                x={segment.textX}
                y={segment.textY}
                textAnchor={segment.textAnchor as any}
                alignmentBaseline="middle"
                fontSize={11}
                fill="#374151"
                fontWeight="500"
              >
                {segment.task.content.length > 8
                  ? segment.task.content.substring(0, 8) + '...'
                  : segment.task.content}
              </SvgText>
            )}
          </G>
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
});

export default ReportDonutChart;
