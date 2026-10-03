import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/**
 * How far a surface anchored to the bottom of the screen has to move up so the keyboard does not
 * cover it, in pixels. Zero while no keyboard is up, and zero on iOS, which answers this itself.
 *
 * Android is the platform that needs an answer, and a `Modal` is where it is missing: a `Modal` is
 * its own window, and on the edge-to-edge windows this app targets, `adjustResize` no longer
 * shrinks that window. Nothing moves the sheet, so the keyboard simply covers the field.
 *
 * The lift is measured the way `KeyboardAvoidingView` measures it, which is the version that
 * survives every windowing quirk: the keyboard's own top edge from the event, subtracted from the
 * bottom of the surface the sheet is anchored to as reported by its layout. A window that does
 * resize reports a raised bottom and needs no lift; one that does not reports the screen bottom
 * and takes the full keyboard height. Reading the anchored surface's own frame is what makes this
 * correct — `useWindowDimensions` reports the main window, which is not this sheet's window.
 *
 * `anchorBottom` is the anchored surface's bottom edge in window coordinates.
 */
export function useKeyboardLift(anchorBottom: number): number {
  const [keyboardTop, setKeyboardTop] = useState<number | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const show = Keyboard.addListener('keyboardDidShow', (event) => {
      setKeyboardTop(event.endCoordinates.screenY);
    });

    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardTop(null);
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  // A keyboard top at or below the anchor means the two do not overlap — a resized window, or a
  // value the platform did not fill in. Reporting a lift anyway would collapse the sheet.
  if (Platform.OS !== 'android' || keyboardTop === null) {
    return 0;
  }

  return Math.max(0, anchorBottom - keyboardTop);
}
