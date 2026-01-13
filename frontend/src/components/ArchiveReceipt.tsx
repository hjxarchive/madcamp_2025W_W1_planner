import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
const Icon = MaterialDesignIcons;
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@constants/index';

interface TaskRecord {
  id: string;
  title: string;
  duration: number; // seconds
  projectColor?: string;
}

interface ArchiveReceiptProps {
  date: string;
  projectTitle: string;
  projectColor: string;
  totalTime: string;
  tasks: TaskRecord[];
  reflection?: string;
  rating?: number;
  onClose?: () => void;
}

export const ArchiveReceipt: React.FC<ArchiveReceiptProps> = ({
  date,
  projectTitle,
  projectColor,
  totalTime,
  tasks,
  reflection,
  rating,
  onClose,
}) => {
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Generate barcode-like pattern
  const generateBarcode = () => {
    const bars = [];
    for (let i = 0; i < 40; i++) {
      const width = Math.random() > 0.5 ? 2 : 1;
      bars.push(
        <View
          key={i}
          style={[
            styles.barcodeBar,
            { width, marginHorizontal: Math.random() > 0.3 ? 1 : 2 }
          ]}
        />
      );
    }
    return bars;
  };

  return (
    <View style={styles.container}>
      {/* Zigzag top edge */}
      <View style={styles.zigzagTop}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={i} style={styles.zigzagTriangle} />
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.storeName}>MOMENTO</Text>
          <Text style={styles.storeSubtitle}>Time Tracker Receipt</Text>
        </View>

        {/* Divider */}
        <View style={styles.dottedDivider} />

        {/* Date and Project */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>DATE</Text>
            <Text style={styles.infoValue}>{date}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>PROJECT</Text>
            <View style={styles.projectInfo}>
              <View style={[styles.projectDot, { backgroundColor: projectColor }]} />
              <Text style={styles.infoValue}>{projectTitle}</Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.dottedDivider} />

        {/* Tasks list */}
        <View style={styles.tasksSection}>
          <Text style={styles.sectionTitle}>TASKS COMPLETED</Text>
          {tasks.map((task, index) => (
            <View key={task.id} style={styles.taskRow}>
              <View style={styles.taskLeft}>
                <Text style={styles.taskIndex}>{String(index + 1).padStart(2, '0')}</Text>
                <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
              </View>
              <Text style={styles.taskDuration}>{formatDuration(task.duration)}</Text>
            </View>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.dottedDivider} />

        {/* Total */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>TOTAL TIME</Text>
          <Text style={styles.totalValue}>{totalTime}</Text>
        </View>

        {/* Rating */}
        {rating !== undefined && (
          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>PRODUCTIVITY</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon
                  key={star}
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={20}
                  color={star <= rating ? '#FFD700' : '#ccc'}
                />
              ))}
            </View>
          </View>
        )}

        {/* Reflection */}
        {reflection && (
          <View style={styles.reflectionSection}>
            <Text style={styles.reflectionLabel}>NOTES</Text>
            <Text style={styles.reflectionText}>{reflection}</Text>
          </View>
        )}

        {/* Divider */}
        <View style={styles.dottedDivider} />

        {/* Barcode */}
        <View style={styles.barcodeSection}>
          <View style={styles.barcodeContainer}>
            {generateBarcode()}
          </View>
          <Text style={styles.barcodeText}>MOMENTO-{Date.now().toString(36).toUpperCase()}</Text>
        </View>

        {/* Thank you message */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your hard work!</Text>
          <Text style={styles.footerSubtext}>Keep tracking, keep growing.</Text>
        </View>
      </ScrollView>

      {/* Zigzag bottom edge */}
      <View style={styles.zigzagBottom}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={i} style={styles.zigzagTriangleBottom} />
        ))}
      </View>

      {/* Close button */}
      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  zigzagTop: {
    flexDirection: 'row',
    height: 10,
    backgroundColor: COLORS.receiptBg,
  },
  zigzagTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.background,
    marginTop: -10,
  },
  zigzagBottom: {
    flexDirection: 'row',
    height: 10,
    backgroundColor: COLORS.receiptBg,
  },
  zigzagTriangleBottom: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.background,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.receiptBg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.base,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  storeName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.receiptText,
    letterSpacing: 4,
  },
  storeSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  dottedDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.receiptBorder,
    borderStyle: 'dashed',
    marginVertical: SPACING.md,
  },
  infoSection: {
    marginBottom: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
  },
  infoValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.receiptText,
    fontFamily: 'monospace',
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  tasksSection: {
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    marginBottom: SPACING.sm,
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.md,
  },
  taskIndex: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    marginRight: SPACING.sm,
    width: 24,
  },
  taskTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.receiptText,
    fontFamily: 'monospace',
    flex: 1,
  },
  taskDuration: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.receiptText,
    fontFamily: 'monospace',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  totalLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.receiptText,
    fontFamily: 'monospace',
  },
  totalValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.receiptText,
    fontFamily: 'monospace',
  },
  ratingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  ratingLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
  },
  stars: {
    flexDirection: 'row',
  },
  reflectionSection: {
    marginBottom: SPACING.sm,
  },
  reflectionLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    marginBottom: SPACING.xs,
  },
  reflectionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.receiptText,
    fontFamily: 'monospace',
    fontStyle: 'italic',
  },
  barcodeSection: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  barcodeContainer: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
  },
  barcodeBar: {
    height: '100%',
    backgroundColor: COLORS.receiptText,
  },
  barcodeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    marginTop: SPACING.xs,
    letterSpacing: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  footerText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.receiptText,
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

export default ArchiveReceipt;
