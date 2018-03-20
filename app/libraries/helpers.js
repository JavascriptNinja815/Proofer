export default () => {}

export function dump (obj) {
  let out = ''
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      out += `${key}: ${obj[key]}\n`
    }
  }

  return out
}

export function mergeObjects (...args) {
  const dst = {}
  let src
  let p
  const aargs = [].splice.call(args, 0)

  while (aargs.length > 0) {
    src = aargs.splice(0, 1)[0]
    if (toString.call(src) === '[object Object]') {
      for (p in src) {
        if (Object.prototype.hasOwnProperty.call(src, p)) {
          if (toString.call(src[p]) === '[object Object]') {
            dst[p] = mergeObjects(dst[p] || {}, src[p])
          } else {
            dst[p] = src[p]
          }
        }
      }
    }
  }

  return dst
}

export function isEmpty (obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object
}

export function getCorrectHours (time) {
  const hours = Math.floor(time / 60)
  const minutes = (time % 60)
  return hours.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false}) + ':' + minutes.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false})
}

export function es6DateToDateTime (date, time) {
  let day = date.getDate()
  const year = date.getFullYear()
  let month = date.getMonth() + 1 // ES6 getMonth returns 0-11, we need it in the format 01-12
  if (month < 10) {
    month = '0' + month
  }
  if (day < 10) {
    day = '0' + day
  }

  return `${year}-${month}-${day} ${getCorrectHours(time)}:00`
}

export function es6TimeToTime (time) {
  let hour = time.getHours()
  let minute = time.getMinutes()
  if (hour < 10) {
    hour = '0' + hour
  }
  if (minute < 10) {
    minute = '0' + minute
  }
  return `${parseInt(hour, 10) * 60} ${parseInt(minute, 10)}`
}


export function LightenDarkenColor (col, amt) {
  var usePound = false;
  if (col[0] == "#") {
      col = col.slice(1);
      usePound = true;
  }
  var num = parseInt(col,16);
  var r = (num >> 16) + amt;
  if (r > 255) r = 255;
  else if  (r < 0) r = 0;

  var b = ((num >> 8) & 0x00FF) + amt;
  if (b > 255) b = 255;
  else if  (b < 0) b = 0;

  var g = (num & 0x0000FF) + amt;
  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
}