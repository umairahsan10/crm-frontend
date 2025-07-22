import React from 'react';
import {
  AiOutlineDashboard,
  AiOutlineTeam,
  AiOutlineCalendar,
  AiOutlineDollar,
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

const iconMap: { [key: string]: React.ComponentType<any> } = {
  AiOutlineDashboard,
  AiOutlineTeam,
  AiOutlineCalendar,
  AiOutlineDollar,
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

export const renderIcon = (iconName: string, props?: any): React.ReactElement | null => {
  const IconComponent = iconMap[iconName];
  if (IconComponent) {
    return React.createElement(IconComponent, props);
  }
  return null;
}; 