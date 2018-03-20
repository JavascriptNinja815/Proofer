import React, { Component } from 'react'
import Link from 'next/link'
import {Grid, Button, Icon} from 'semantic-ui-react'
import { Link as ScrollLink, Element } from 'react-scroll'

import moment from 'moment'

import Notification from '../../Notification'
import CreatePost from '../../CreatePost'
import PostItem from '../PostItem'
import Sticky from '../../Sticky'
import Campaigns from '../../Campaigns'

import { es6DateToDateTime, getCorrectHours } from '../../../libraries/helpers'
import { months, days } from '../../../libraries/constants'

// Graphql
import calendarSlotsGql from '../graphql/calendarSlots.gql'

if (process.env.BROWSER) {
  require('./styles.scss')
}

class PostList extends Component {
  constructor (props) {
    super(props)
    const posts = this.props.posts ? this.props.posts.map((e) => ({...e.node})).sort((a, b) => a.time - b.time) : []

    this.state = {
      posts: posts,
      currentYear: '',
      currentMonth: '',
      currentDate: '',
      availableDates: [],
      activeDate: null,
      wholeDayEnable: false,
      selectedCategory: '',
      catId: '',
      rightPanelType: '',
      rightPanelOpen: false,
      createPostOpen: false,
      loading: false
    }
  }

  /*shouldComponentUpdate = (nextProps, nextState) => {
    if (nextProps.socialId === null) {
      return false
    }
    return true
  }*/

  componentDidMount () {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()
    const currentDate = new Date().getDate()
    const availableDates = this.getDaysInMonth(currentDate, currentMonth, currentYear)

    this.setState({
      currentYear,
      currentMonth,
      currentDate,
      availableDates
    })
  }

  onMonthChange = (isNext) => {
    const {currentDate, currentMonth, currentYear, wholeDayEnable} = this.state
    const realYear = new Date().getFullYear()
    const realMonth = new Date().getMonth()
    if (currentMonth === realMonth && currentYear === realYear && !wholeDayEnable) {
      const newMonth = isNext ? currentMonth + 1 : currentMonth - 1
      const newYear = isNext ? currentYear + 1 : currentYear - 1
      if (newMonth > -1 && newMonth < 12) {
        const currMonth = isNext ? currentMonth + 1 : currentMonth - 1
        const availableDates = this.getDaysInMonth(currentDate, currMonth, currentYear)
        this.setState({
          currentMonth: currMonth,
          availableDates,
          wholeDayEnable: true,
          activeDate: null,
          loading: true
        })
      } else {
        const currMonth = isNext ? 0 : 11
        const currYear = newYear
        const availableDates = this.getDaysInMonth(currentDate, currMonth, currYear)
        this.setState({
          currentMonth: currMonth,
          currentYear: currYear,
          availableDates,
          activeDate: null,
          loading: true
        })
      }
    } else {
      const newMonth = isNext ? currentMonth + 1 : currentMonth - 1
      const newYear = isNext ? currentYear + 1 : currentYear - 1
      if (newMonth > -1 && newMonth < 12) {
        const currMonth = newMonth
        const availableDates = this.getDaysInMonth(currentDate, currMonth, currentYear)
        this.setState({
          currentMonth: currMonth,
          availableDates,
          wholeDayEnable: false,
          activeDate: null,
          loading: true
        })
      } else {
        const currMonth = isNext ? 0 : 11
        const currYear = newYear
        const availableDates = this.getDaysInMonth(currentDate, currMonth, currYear)
        this.setState({
          currentMonth: currMonth,
          currentYear: currYear,
          availableDates,
          activeDate: null,
          loading: true
        })
      }
    }
  }

  getDaysInMonth = (currentdate, month, year) => {
    const {wholeDayEnable} = this.state
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    let date
    if (month !== currentMonth || year !== currentYear) {
      date = new Date(year, month, 1)
    } else {
      if (!wholeDayEnable) {
        date = new Date(year, month, currentdate)
      } else {
        date = new Date(year, month, 1)
      }
    }

    const days = []
    while (date.getMonth() === month) {
      days.push(new Date(date))
      date.setDate(date.getDate() + 1)
    }
    return days
  }

  onTogglePanel = (catId) => {
    this.setState({
      catId: catId !== this.state.catId ? catId : '',
      categoryItemEnabled: false,
      rightPanelOpen: catId !== this.state.catId
    })
  }

  onSetActive = (date) => {
    this.setState({
      activeDate: `${days[date.getDay() + 1]}, ${date.getDate() + 1 + 'th '}`
    })
  }

  renderStickyHeader = () => {
    const {availableDates, currentYear, currentMonth} = this.state
    return (<Sticky className='white-background content-header' rightPanelOpen={this.state.rightPanelOpen}>
      <div className='scroll-sticky-header'>
        <div className='scroll-date'>
          {availableDates.map((date, index) => {
            return (<div key={index} className='scrollspy-item'>
              <ScrollLink
                activeClass='active'
                className='day-link'
                to={`day_${date.getDate()}`}
                offset={0}
                spy
                smooth
                isDynamic
                onSetActive={() => this.onSetActive(date)}
              >
                <Icon name='calendar' />{this.state.activeDate || `${days[date.getDay()]},  ${date.getDate() + 'th '}`}
              </ScrollLink>
            </div>
            )
          })
          }
        </div>
        <div className='scroll-month'>
          <Icon name='chevron left' onClick={() => this.onMonthChange(false)} />
          <span className='month-label'>
            {months[currentMonth]}'{`${currentYear}`.substr(2, 3)}
          </span>
          <Icon name='chevron right' onClick={() => this.onMonthChange(true)} />
        </div>
        <div className='scroll-actions'>
          &nbsp
        </div>
      </div>
    </Sticky>)
  }

  getContentScheduleValue = (date, slot) => {
    const dateValue = es6DateToDateTime(date, slot.time)

    const scheduleValue = {
      id: slot.id,
      contentId: '',
      scheduleid: '',
      category: slot.category,
      date: date,
      time: slot.time,
      text: '',
      media: [],
      moderationStatus: '',
      socialProfile: slot.socialProfile,
      socialNetwork: slot.socialProfile.socialNetwork,
      comments: []
    }

    slot.contentSchedules.map((e) => {
      if (e.publishAt.toString() === dateValue.toString()) {
        scheduleValue.contentId = e.content.id
        scheduleValue.scheduleId = e.id
        scheduleValue.text = e.content.text
        scheduleValue.media = e.content.media
        scheduleValue.moderationStatus = e.moderationStatus
        scheduleValue.comments = e.content.comments.edges.map(e => ({...e.node}))
      }
    })

    return scheduleValue
  }

  onOpenModal = () => {
    this.setState({
      createPostOpen: true
    })
  }

  onCloseModal = () => {
    this.setState({
      createPostOpen: false
    })
  }

  getCalendarTime = (slottime) => {
    return parseInt(moment(slottime).format('HH'), 10) * 60 + parseInt(moment(slottime).format('mm'), 10)
  }

  renderEmptyPostitem = (key, slotTime) => {
    return (<div key={key} className='post-item-wrapper empty-item'>
      <div className='nothing-item-content'>
        <div className='nothing-empty' />
        <div className='nothing-text'>
          No campaign selected for {getCorrectHours(slotTime)}.
        </div>
        <div className='nothing-actions'>
          <Link prefetch href='/app/calendar'><a className='ui button goto-calendar success empty'>Go to Calendar</a></Link>
          <Button className='create-post success' onClick={this.onOpenModal}>Create Post</Button>
        </div>
      </div>
    </div>)
  }

  loadMore = (pageNumber) => {
    const _posts = this.state.posts
    const { oldEndCursor, endCursor, loading } = this.state
    if (endCursor === oldEndCursor || loading) {
      return
    }
    /* console.log('=== Load More ===')
    console.log('endCursor - ' + endCursor)
    console.log('oldEndCursor - ' + oldEndCursor) */
    this.setState({
      loading: true
    })
    this.props.client.query({
      query: calendarSlotsGql,
      variables: {
        profileIds: this.props.socialIds,
        type: 'WEEKLY'
      },
      props: ({data: { calendarSlots_find, loading, error }}) => ({ calendarSlotsFind: calendarSlots_find, loading, error })
    }).then((graphQLResult) => {
      const { errors, data } = graphQLResult
      if (errors) {
        if (errors.length > 0) {
          Notification.error(errors[0].message)
        }
      } else {
        // console.log('newCursor - ' + data.media_find.pageInfo.endCursor)
        this.setState({
          posts: [..._posts, ...data.calendarSlotsFind.edges],
          hasMore: data.calendarSlotsFind.pageInfo.hasNextPage,
          endCursor: data.calendarSlotsFind.pageInfo.endCursor,
          oldEndCursor: endCursor,
          loading: false
        })
      }
    }).catch((error) => {
      Notification.error(error.message)
    })
  }

  render () {
    const {posts, availableDates, rightPanelOpen} = this.state
    const postTimes = posts.map(post => post.time).filter((value, index, self) => {
      return self.indexOf(value) === index
    }).sort((a, b) => a - b)
    const currTime = this.getCalendarTime(new Date())
    const currDay = (new Date()).getDay()
    return (<Grid centered id='posts-container'>
      <Grid.Row columns={2} className='content-row'>
        <Grid.Column tablet={10} computer={10} largeScreen={10} widescreen={8} className="conetnt-row-column">
          {this.renderStickyHeader()}
          <div className='no-margin no-padding content-item-list' id='posts-wrapper'>
            {
              availableDates.map((date, index) => {
                const renderItems = []
                postTimes.map(time => {
                  let renderItem = null
                  posts.map(slot => {
                    if (slot.day === date.getDay()) {
                      if (slot.time === time) {
                        if (date.getDay() === currDay) {
                          if (time > currTime) {
                            const scheduleRenderValue = this.getContentScheduleValue(date, slot)
                            renderItem = (
                              <PostItem
                                key={Math.random()}
                                slotValue={scheduleRenderValue}
                                socialId={scheduleRenderValue.socialProfile.id}
                                socialNetwork={scheduleRenderValue.socialNetwork}
                                onShowCampaign={this.onTogglePanel}
                              />
                            )
                          }
                        } else {
                          const scheduleRenderValue = this.getContentScheduleValue(date, slot)
                          renderItem = (
                            <PostItem
                              key={Math.random()}
                              slotValue={scheduleRenderValue}
                              socialId={scheduleRenderValue.socialProfile.id}
                              socialNetwork={scheduleRenderValue.socialNetwork}
                              onShowCampaign={this.onTogglePanel}
                            />
                          )
                        }
                      }
                    }
                  })
                  if (!renderItem) {
                    if (date.getDay() === currDay) {
                      if (time > currTime) {
                        renderItem = this.renderEmptyPostitem(date.getDay() + time, time)
                      }
                    } else {
                      renderItem = this.renderEmptyPostitem(date.getDay() + time, time)
                    }
                  }

                  if (renderItem) {
                    renderItems.push(renderItem)
                  }
                })

                return (<div className='post-item' key={index}>
                  <div key={Math.random()} className='scrollspy-item'>
                    <div className='post-link'>
                    {/*<ScrollLink
                      activeClass='active'
                      className='post-link'
                      to={`day_${date.getDate()}`}
                      offset={0}
                      spy
                      smooth
                      isDynamic
                      onSetActive={() => this.onSetActive(dates[0])}
                    >*/}
                      <div className='post-date'>
                        <div>{days[date.getDay()]}</div>
                        <div>{date.getDate() + 'th '}</div>
                      </div>
                    </div>
                  </div>
                  <Element
                    key={`${date.getMonth().toString()}_${date.getDate().toString()}`}
                    id={`day_${date.getDate().toString()}`}
                    name={`day_${date.getDate().toString()}`}
                  >
                    {renderItems.length > 0 ?
                      renderItems
                      :
                      <div key={`${date.getMonth().toString()}_${date.getDate().toString()}_0`} className='post-item-wrapper empty-item'>
                        <div className='nothing-item-content'>
                          <div className='nothing-empty' />
                          <div className='nothing-text'>
                            No content for today
                          </div>
                          <div className='nothing-empty' />
                        </div>
                      </div>
                    }
                  </Element>
                </div>)
              })
            }
          </div>
          <CreatePost
            modalOpen={this.state.createPostOpen}
            socialId={this.props.socialId}
            selectedCategoryId={this.state.selectedCategory.id}
            onCloseModal={this.onCloseModal}
          />
        </Grid.Column>
        {rightPanelOpen && <Campaigns
          isMulti
          open={rightPanelOpen}
          width={6}
          socialId={this.props.socialId}
          categoryId={this.state.catId}
          onTogglePanel={this.onTogglePanel}
        />
        }
      </Grid.Row>
    </Grid>)
  }
}

export default PostList
