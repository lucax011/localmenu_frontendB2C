import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { OrderStatus } from '@/api/types';
import { STATUS_COLOR, STATUS_LABEL } from '@/utils/format';

export default function StatusChip({ status }: { status: OrderStatus }) {
  const color = STATUS_COLOR[status];
  return (
    <View style={[styles.chip, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{STATUS_LABEL[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  dot: { borderRadius: 4, height: 8, width: 8 },
  text: { fontSize: 12, fontWeight: '700' },
});
