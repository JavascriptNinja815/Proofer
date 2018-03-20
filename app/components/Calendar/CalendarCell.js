import React, { Component } from 'react'
import { graphql, compose } from 'react-apollo'
import Notification from '../Notification'
import { Icon, Table, Image, Popup, Input } from 'semantic-ui-react'
import TimePicker from 'rc-time-picker'
import moment from 'moment'

// import Freshness from '../Freshness'

import { isEmpty, getCorrectHours } from '../../libraries/helpers'

import { createCalendarSlotMutation, updateCalendarSlotMutation, deleteCalendarSlotMutation, editCalendarRowTimeMutation } from './graphql/calendarMutations'

if (process.env.BROWSER) {
  require('./styles/rc-time-picker.scss')
}

const format = 'HH:mm'

class CalendarCell extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isShowPopup: false,
      categories: this.props.categories
    }
  }

  getCalendarTime = (slottime) => {
    return parseInt(moment(slottime).format('HH'), 10) * 60 + parseInt(moment(slottime).format('mm'), 10)
  }

  onCellUpdate = (calendarSlotDay, calendarSlotTime, slotDetail, data) => {
    const selectedTime = this.getCalendarTime(calendarSlotTime)
    const draggedData = data.node // JSON.parse(data['content'])
    console.log(draggedData)
    this.props.onCalendarTableUpdate(selectedTime, draggedData, calendarSlotDay)
    if (isEmpty(slotDetail)) {
      this.onCreateCalendarSlot(calendarSlotDay, selectedTime, draggedData)
    } else {
      this.onEditCalendarSlot(calendarSlotDay, selectedTime, slotDetail.id, draggedData)
    }
  }

  onCreateCalendarSlot = (calendarSlotDay, calendarSlotTime, category) => {
    const socialProfileId = this.props.socialId
    const calendarSlotType = 'WEEKLY'
    const categoryId = category.id
    this.props.createCalendarSlot({ calendarSlotDay, calendarSlotTime, calendarSlotType, categoryId, socialProfileId })
    .then((data) => {
      Notification.success('Create Calendarslot is success.')
    })
  }

  onEditCalendarSlot = (calendarSlotDay, calendarSlotTime, calendarSlotId, category) => {
    const calendarSlotType = 'WEEKLY'
    const categoryId = category.id
    this.props.editCalendarSlot({calendarSlotId, calendarSlotDay, calendarSlotTime, calendarSlotType, categoryId})
    .then((data) => {
      Notification.success('Edit Calendarslot is success.')
    })
  }

  onDelEvent = (time) => {
    const deletedTime = this.getCalendarTime(time)
    const {slot} = this.props
    Object.keys(slot).forEach((day) => {
      this.props.onDelEvent(deletedTime)
      if (slot[day].id !== undefined) {
        this.onDeleteCalendarSlot(slot[day].id)
      }
    })
  }

  onDeleteCalendarSlot = (id) => {
    this.props.deleteCalendarSlot({ id })
    const cellTime = this.props.cellTime
    const slots = this.props.slots
    const copySlots = slots
    slots[cellTime][this.props.day] = {}
    this.props.onSlotsUpdate(slots)
    .then((data) => {
      Notification.success('Remove Calendar Slot is success.')
    })
    .catch((err) => {
      console.log(err)
      this.props.onSlotsUpdate(copySlots)
    })
  }

  onTimeUpdate = (value) => {
    const cellTime = this.props.cellTime
    const newTime = this.getCalendarTime(value)
    const slots = this.props.slots
    const oldDays = slots[cellTime]
    const calendarSlotIds = []

    Object.keys(oldDays).forEach((day) => {
      if (oldDays[day].id) {
        oldDays[day].time = newTime
        calendarSlotIds.push(oldDays[day].id)
      }
    })
    slots[newTime] = oldDays
    delete slots[cellTime]
    Object.keys(slots).sort()

    this.props.onSlotsUpdate(slots)
    this.props.editCalendarRowTime({
      calendarSlotIds,
      newTime
    }).then((data) => {
      Notification.success('Update Calendar Slot is success.')
    })
  }

  hexToRGB = (hex, opacity) => {
    hex = parseInt(hex.slice(1), 16)
    let r = hex >> 16
    let g = hex >> 8 & 0xFF
    let b = hex & 0xFF
    return `rgba(${r},${g},${b},${opacity})`
  }

  handleOpen = () => {
    this.setState({ isShowPopup: true })
  }

  handleClose = () => {
    this.setState({ isShowPopup: false })
  }

  render () {
    let { cellTime, type, day, obj } = this.props
    const time = moment(getCorrectHours(cellTime), 'HH:mm')
    if (type === 'time') {
      let sunIcon = '/static/images/sun.png'
      if (cellTime < 720) { // Before mid-day
        sunIcon = '/static/images/sunrise.png'
      }
      if (cellTime > 1080) { // After 6PM
        sunIcon = '/static/images/sunset.png'
      }
      return (
        <Table.Cell className='calendar-time-cell'>
          <Image inline src={sunIcon} />
          <TimePicker
            id='custom-time-picker'
            value={time}
            showSecond={false}
            onChange={this.onTimeUpdate}
            format={format}
          />
          <Icon name='trash' className='remove-icon-row' onClick={() => this.onDelEvent(time)} />
        </Table.Cell>
      )
    }

    if (obj.category) {
      const backColor = this.hexToRGB(obj.category.color, 0.25)
      const hoverCatColor = this.hexToRGB(obj.category.color, 0.4)
      const catColor = this.hexToRGB(obj.category.color, 1)
      return (
        <Table.Cell
          className='calendar-cell no-border'
          style={{ backgroundColor: backColor }}
        >
          <div
            className='category-label'
            style={{color: catColor}}
          >
            <span
              className='category-label-name'
              style={{ backgroundColor: this.props.catId === obj.category.id ? hoverCatColor : 'transparent' }}
              onClick={() => this.props.onCellClicked(obj.category.id)}
            >
              {obj.category.name}
            </span>
          </div>
          {/*<Popup
            trigger={<div
              className='category-label'
              onClick={this.handleOpen}
              style={{color: catColor}}
            >

            </div>}
            content={<div className='quality-post-popup'>
              <div className='quality-data'>
                <div>
                  <b>Performance</b>
                  <Icon name='thumbs outline up' />
                </div>
                <div>
                  <b>Freshness</b>
                  <Freshness percentage={98} />
                </div>
              </div>
              <Button className='success' content='Go to post' />
            </div>}
            on='click'
            open={this.state.isShowPopup}
            onClose={this.handleClose}
            position='bottom center'
          />*/}
          <Icon
            name='trash'
            className='remove-icon'
            onClick={() => this.onDeleteCalendarSlot(obj.id)}
            style={{color: catColor}}
          />
        </Table.Cell>
      )
    }

    const filteredCategories = this.state.searchTerm ? this.state.categories.filter(item => item.node.name.includes(this.state.searchTerm)) : this.state.categories || []

    return (
      <Table.Cell className='calendar-cell'>
        <Popup
          trigger={<div
            className='addcategory-label'
            onClick={this.handleOpen}
          >
            <Icon name='plus circle' />
          </div>}
          content={<div className='add-category-popup'>
            <Input
              placeholder='Search...'
              onChange={(event, {value}) => this.setState({searchTerm: value})}
            />
            <ul className='add-category-list'>
              {filteredCategories.length > 0 ?
                filteredCategories.map(cat => {
                  return (
                    <li className='add-category-item' onClick={() => this.onCellUpdate(day, time, obj, cat)}>
                      <div className='add-category-color' style={{backgroundColor: cat.node.color}} />
                      {cat.node.name}
                    </li>
                  )
                })
                :
                <li className='add-category-item'>
                  Categories not found
                </li>
              }
            </ul>
          </div>}
          on='click'
          open={this.state.isShowPopup}
          onClose={this.handleClose}
          position='bottom center'
        />
      </Table.Cell>
    )
  }
}

export default compose(
  graphql(createCalendarSlotMutation, {
    props ({ ownProps, mutate }) {
      return {
        createCalendarSlot ({ calendarSlotDay, calendarSlotTime, calendarSlotType, categoryId, socialProfileId }) {
          return mutate({
            variables: {
              input: {
                calendarSlotDay,
                calendarSlotTime,
                calendarSlotType,
                categoryId,
                socialProfileId
              }
            }
          })
        }
      }
    }
  }),
  graphql(updateCalendarSlotMutation, {
    props ({ ownProps, mutate }) {
      return {
        editCalendarSlot ({ calendarSlotId, calendarSlotDay, calendarSlotTime, calendarSlotType, categoryId }) {
          return mutate({
            variables: {
              input: {
                calendarSlotId,
                calendarSlotDay,
                calendarSlotTime,
                calendarSlotType,
                categoryId
              }
            }
          })
        }
      }
    }
  }),
  graphql(deleteCalendarSlotMutation, {
    props ({ ownProps, mutate }) {
      return {
        deleteCalendarSlot ({id}) {
          return mutate({
            variables: {
              input: {
                id
              }
            }
          })
        }
      }
    }
  }),
  graphql(editCalendarRowTimeMutation, {
    props ({ ownProps, mutate }) {
      return {
        editCalendarRowTime ({ calendarSlotIds, newTime }) {
          return mutate({
            variables: {
              input: {
                calendarSlotIds,
                newTime
              }
            }
          })
        }
      }
    }
  })
)(CalendarCell)
