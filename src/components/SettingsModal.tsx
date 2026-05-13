import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { isSoundEnabled, setSoundEnabled } from '../lib/sounds';

interface Props {
  visible: boolean;
  onClose: () => void;
  onHome: () => void;
  onReplay: () => void;
}

export function SettingsModal({ visible, onClose, onHome, onReplay }: Props) {
  const [soundOn, setSoundOn] = useState(isSoundEnabled);

  function toggleSound(val: boolean) {
    setSoundOn(val);
    setSoundEnabled(val);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>

          {/* Title bar */}
          <View style={styles.titleRow}>
            <View style={styles.titleSpacer} />
            <Text style={styles.title}>Settings</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Rows panel */}
          <View style={styles.panel}>

            {/* Sound */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>🔊</Text>
                <Text style={styles.rowLabel}>Sound</Text>
              </View>
              <Switch
                value={soundOn}
                onValueChange={toggleSound}
                trackColor={{ false: '#5A6A8A', true: '#4CD964' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#5A6A8A"
              />
            </View>

            <View style={styles.divider} />

            {/* Home */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>🏠</Text>
                <Text style={styles.rowLabel}>Home</Text>
              </View>
              <TouchableOpacity style={styles.actionBtn} onPress={onHome}>
                <Text style={styles.actionText}>Back</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* Replay */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>🔄</Text>
                <Text style={styles.rowLabel}>Replay</Text>
              </View>
              <TouchableOpacity style={styles.actionBtn} onPress={onReplay}>
                <Text style={styles.actionText}>Play</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '78%',
    backgroundColor: '#3D5CE8',
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  titleSpacer: {
    width: 32,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  panel: {
    backgroundColor: '#2E4BD4',
    marginHorizontal: 12,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowIcon: {
    fontSize: 22,
    width: 30,
    textAlign: 'center',
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 18,
  },
  actionBtn: {
    backgroundColor: '#48C96A',
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
