import React, { Component } from 'react'
import { graphql, withApollo, compose } from 'react-apollo'
import gql from 'graphql-tag'
import getSignUpMessage from './signUpMessage'

import Link from 'next/link'
import Router from 'next/router'
import {Grid, Header, Form, Button, Message} from 'semantic-ui-react'
import Notification from '../Notification'

import { isEmail, isStringEmpty } from '../../libraries/validations'

import createUserGql from './createUser.gql'
import Logo from '../../static/images/proofer-logo.svg'

if (process.env.BROWSER) {
  require('./styles.scss')
  require('../NoAuth.scss')
}

class SignUp extends Component {

  constructor(props) {
    super(props)
    this.state = {
      createdUser: this.props.createdUser,
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      password2: '',
      loading: false,
      userMessage: getSignUpMessage(this.props.query.message),
    }
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  handleSubmit = (event) => {
    event.preventDefault()
    event.stopPropagation()

    const { firstname, lastname, email, password } = this.state

    if (!isEmail(email)) {
      Notification.error('Please enter a valid email address')
      return
    }

    if (isStringEmpty(firstname)) {
      Notification.error('First name field can not be empty')
      return
    }
    if (isStringEmpty(lastname)) {
      Notification.error('Last name field can not be empty')
      return
    }
    if (isStringEmpty(password)) {
      Notification.error('Password field can not be empty')
      return
    }

    const client = this.props.client

    this.setState({loading: true})

    this.props.createUser({input: { userFirstName: firstname, userLastName: lastname, userEmail: email, userPassword: password }})
    .then((graphQLResult) => {
      const { errors, data } = graphQLResult

      if (errors) {
        if (errors.length > 0) {
          this.setState({loading: false})
          Notification.error(errors[0].message)
        }
      } else {
        if (data.createUser) {
          Notification.success('You\'re registered successfully!')
          this.setState({createdUser: true, loading: false})
        }
      }
    }).catch((error) => {
      this.setState({loading: false})
      Notification.error(error.message)
    })
  }

  render () {
    const { createdUser, userMessage } = this.state

    if (createdUser) {
      return (
        <div className='no-auth-page'>
          <Grid centered id='no-auth-container'>
            <Grid.Row columns={1}>
              <Grid.Column mobile={16} tablet={8} computer={8} largeScreen={6} widescreen={4}>
                <Header className="custom-header">
                  <Logo width='50%' className='align-center custom-image-style'/>
                  Create a new Account
                </Header>
                <h3 className='title-header'>
                  Please, check your email to activate your account.
                </h3>
                <div className="secondary-action">
                  If you have already activated the account, please
                  {' '}
                  <Link prefetch href='/app/login'><a>Sign In</a></Link>
                </div>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>)
    } else {
      const { firstname, lastname, email, password, password2 } = this.state
      return (
          <div className='no-auth-page'>
            <Grid centered id='no-auth-container'>
              <Grid.Row columns={1}>
                <Grid.Column mobile={16} tablet={8} computer={8} largeScreen={6} widescreen={4}>
                  {userMessage &&
                  <Message color="blue">
                    {userMessage}
                  </Message>
                  }
                  <Header className="custom-header-long">
                    <Logo width='80%' className='align-center custom-image-style' />
                    Create a new Account
                  </Header>
                  <Form onSubmit={this.handleSubmit.bind(this)} className='input-form'>
                    <Form.Input required  placeholder='First Name' type='text' name='firstname' value={firstname} onChange={this.handleChange}  className="input" />
                    <Form.Input required  placeholder='Last Name' type='text' name='lastname' value={lastname} onChange={this.handleChange} className="input"/>
                    <Form.Input required  placeholder='Email' type='text' name='email' value={email} onChange={this.handleChange} className="input" />
                    <Form.Input required  placeholder='Password' type='password' name='password' min={6} value={password} onChange={this.handleChange} className="input"/>
                    <Form.Input required  placeholder='Repeat Password' type='password' name='password2' min={6} value={password2} onChange={this.handleChange} className="input"/>
                    <Button type='submit'  className="submit-button field input" loading={this.state.loading}>Sign Up</Button>
                    {createdUser &&
                      <div style={{ color: '#006B00', padding: '10px' }}>
                          User created successfully!
                     </div>}
                     <div className="secondary-action">
                       Already have an account? <Link prefetch href='/app/login'><a className='signin-button'>Sign In</a></Link>
                     </div>
                  </Form>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </div>)
    }
  }
}

export default compose(
  // withApollo exposes `this.props.client` used when logging out
  withApollo,
  graphql(gql`${createUserGql}`, {
    props ({ mutate }) {
      return {
        createUser (signupVariables) {
          return mutate({ variables: signupVariables })
        }
      }
    }
  })
)(SignUp)
