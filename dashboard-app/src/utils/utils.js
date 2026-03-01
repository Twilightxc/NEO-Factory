export const calculateFlowSpeed = (value) => {

  if (!value || isNaN(value) || value <= 0) return '0s';

  const k = 30;
  const duration = k / value;


  const finalDuration = Math.max(0.3, Math.min(duration, 5.0));

  return `${finalDuration.toFixed(2)}s`;
};


export const formatSensorValue = (value, decimals = 2) => {
  if (value === null || value === undefined || value === '' || isNaN(value)) return "--";
  return Number(value).toFixed(decimals);
};