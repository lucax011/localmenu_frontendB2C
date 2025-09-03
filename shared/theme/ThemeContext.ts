import React from 'react';
import { colors, typography, spacing } from './index';

const theme = { colors, typography, spacing };

const ThemeContext = React.createContext(theme);

export default ThemeContext;