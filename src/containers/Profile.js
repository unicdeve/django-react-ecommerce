import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { Button, Header, Grid, Divider, Menu, Loader, Segment, Dimmer, Message, Card, Label } from 'semantic-ui-react';
import { authAxios } from '../utils';
import { addressListURL, getCountriesListURL, getUserIdURL, addressDeleteURL } from '../constants';
import AddressForm from './AddressForm';

const UPDATE_FORM = 'UPDATE_FORM';
const CREATE_FORM = 'CREATE_FORM';


class Profile extends Component {

  state = {
    userID: null,
    activeItem: 'billingAddress',
    addresses: [],
    countries: [],
    selectedAddress: null
  }

  componentDidMount() {
    this.handleFetchAddresses();
    this.handleFetchCountries();
    this.handleFetchUserID();
  }

  handleSelectedAddress = address => {
    this.setState({
      selectedAddress: address
    })
  }

  handleItemClick = name => {
    this.setState({ activeItem: name }, () => {
      this.handleFetchAddresses();
    });
  }

  handleFetchAddresses = () => {
    this.setState({ loading: true });

    const { activeItem } = this.state;
    authAxios.get(addressListURL(activeItem === 'billingAddress' ? 'B' : 'S'))
      .then(res => {
        this.setState({ addresses: res.data, loading: false });
      })
      .catch(err => {
        this.setState({ loading: false, error: err.response.data });
      })
  }

  handleFormatCountries = countries => {
    const keys = Object.keys(countries);
    return keys.map(k => {
      return {
        key: k,
        text: countries[k],
        value: k
      }
    })
  }

  handleFetchUserID = () => {
    authAxios.get(getUserIdURL)
      .then(res => {
        this.setState({ userID: res.data.userId });
      })
      .catch(err => {
        this.setState({ error: err.response.data });
      })
  }

  handleFetchCountries = () => {
    authAxios.get(getCountriesListURL)
      .then(res => {
        this.setState({ countries: this.handleFormatCountries(res.data) });
      })
      .catch(err => {
        this.setState({ error: err.response.data });
      })
  }

  handleDelete = addressID => {
    authAxios.delete(addressDeleteURL(addressID))
      .then(res => {
        this.handleCallback();
      })
      .catch(err => {
        this.setState({ error: err.response.data });
      })
  }

  handleCallback = () => {
    this.handleFetchAddresses();
    this.setState({ selectedAddress: null })
  }

  render() {
    const { activeItem, loading, error, addresses, countries, selectedAddress, userID } = this.state;

    const { isAuthenticated } = this.props;

    
    if(!isAuthenticated) {
      return <Redirect to='/login' />
    }

    return (
      <Grid container columns={2} divided>
        <Grid.Row columns={1}>
          <Grid.Column>
            {error && (
              <Message
                error
                header="Some error occured!"
                content={JSON.stringify(error)}
              />
            )}

            {loading && (
              <Segment>
                <Dimmer active inverted>
                  <Loader inverted content='Loading' />
                </Dimmer>
              </Segment>
            )}
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={6}>
            <Menu pointing vertical fluid>
              <Menu.Item
                name='Billing Address'
                active={activeItem === 'billingAddress'}
                onClick={() => this.handleItemClick('billingAddress')}
              />
              <Menu.Item
                name='Shipping Address'
                active={activeItem === 'shippingAddress'}
                onClick={() => this.handleItemClick('shippingAddress')}
              />
              <Menu.Item
                name='Payment History'
                active={activeItem === 'paymentHistory'}
                onClick={() => this.handleItemClick('paymentHistory')}
              />
            </Menu>
          </Grid.Column>

          <Grid.Column width={10}>
            <Header>{`Update your ${activeItem === 'billingAddress' ? 'billing' : 'shipping'} address`}</Header>
            <Divider />

            <Card.Group>
              {addresses.map(a => {
                return (
                  <Card fluid key={a.id}>
                    <Card.Content>
                      {a.default && <Label as='a' ribbon='right' color='green'>Default</Label>}
                      <Card.Header>{a.street_address}, {a.apartment_addres}</Card.Header>
                      <Card.Meta>{a.country}</Card.Meta>
                      <Card.Description>{a.zip}</Card.Description>
                    </Card.Content>

                    <Card.Content extra>
                      <Button color='yellow' onClick={() => this.handleSelectedAddress(a)}>
                        Update
                        </Button>
                      <Button color='red' onClick={() => this.handleDelete(a.id)}>
                        Delete
                        </Button>
                    </Card.Content>
                  </Card>
                )
              })}
            </Card.Group>

            <Divider />

            {selectedAddress === null ?
              <AddressForm countries={countries} callback={this.handleCallback} formType={CREATE_FORM} userID={userID} activeItem={activeItem} />
              :
              null
            }
            {selectedAddress && <AddressForm countries={countries} callback={this.handleCallback} userID={userID} activeItem={activeItem} formType={UPDATE_FORM} address={selectedAddress} />}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }

}

const mapStateToProps = state => {
  return {
    isAuthenticated: state.auth.token !== null
  }
}

export default connect(mapStateToProps)(Profile);
