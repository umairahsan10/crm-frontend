// eslint-disable-next-line @typescript-eslint/no-explicit-any
import React from 'react';
import {
  AiOutlineDashboard,
  AiOutlineTeam,
  AiOutlineCalendar,
  AiOutlineBarChart,
  AiOutlineBank,
  AiOutlineReload,
  AiOutlineSetting,
  AiOutlineUser,
  AiOutlineSearch,
  AiOutlineBell,
  AiOutlineLogout,
  AiOutlineEye,
  AiOutlineEyeInvisible,
} from 'react-icons/ai';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap: { [key: string]: React.ComponentType<any> } = {
  AiOutlineDashboard,
  AiOutlineTeam,
  AiOutlineCalendar,
  AiOutlineBarChart,
  AiOutlineBank,
  AiOutlineReload,
  AiOutlineSetting,
  AiOutlineUser,
  AiOutlineSearch,
  AiOutlineBell,
  AiOutlineLogout,
  AiOutlineEye,
  AiOutlineEyeInvisible,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const renderIcon = (iconName: string, props?: any): React.ReactElement | null => {
  const IconComponent = iconMap[iconName];
  if (IconComponent) {
    return React.createElement(IconComponent, props);
  }
  return null;
}; 