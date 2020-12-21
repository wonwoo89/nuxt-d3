export default (dateValue: string | number, format: string) => {
  const monthNameArr = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const newDate = new Date(dateValue)
  const fullYear = newDate.getFullYear().toString()
  const shortYear = fullYear.substr(2, 4)
  const month = (newDate.getMonth() + 1).zeroPadded()
  const monthName = monthNameArr[+month - 1]
  const date = newDate.getDate().zeroPadded()
  const hour = newDate.getHours().zeroPadded()
  const min = newDate.getMinutes().zeroPadded()
  const sec = newDate.getSeconds().zeroPadded()
  const rules: { reg: RegExp; value: string | Number }[] = [
    { reg: /(%Y)/g, value: fullYear },
    { reg: /(%y)/g, value: shortYear },
    { reg: /(%m)/g, value: month },
    { reg: /(%b)/g, value: monthName },
    { reg: /(%d)/g, value: date },
    { reg: /(%H)/g, value: hour },
    { reg: /(%M)/g, value: min },
    { reg: /(%S)/g, value: sec },
  ]

  return rules.reduce(
    (formattedDate, { reg, value }) =>
      formattedDate.replace(reg, value as string),
    format
  )
}
