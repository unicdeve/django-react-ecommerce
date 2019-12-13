import React from 'react';
import axios from 'axios';
import {
    Button,
    Icon,
    Image,
    Item,
    Label,
    Container,
    Loader,
    Dimmer,
    Segment,
    Message
} from 'semantic-ui-react'

import { productListURL, addToCartURL } from '../constants';
import { authAxios } from '../utils';


class ProductList extends React.Component {
    state = {
        loading: false,
        error: null,
        data: []
    }

    componentDidMount() {
        this.setState({ loading: true });

        axios.get(productListURL)
            .then(res => {
                this.setState({ data: res.data, loading: false });
            })
            .catch(error => {
                this.setState({ error, loading: false })
            })
    }

    handleAddToCart = slug => {
        this.setState({ loading: true });

        authAxios.post(addToCartURL, { slug })
            .then(res => {
                console.log("Added to cart", res.data)
                // update cart count
                this.setState({ loading: false });
            })
            .catch(error => {
                this.setState({ error: error.response.data, loading: false });
            })
    }

    render() {
        const { loading, error, data } = this.state;

        return (
            <Container>
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

                        <Image src='/images/wireframe/short-paragraph.png' />
                    </Segment>
                )}

            <Item.Group divided>
                {data.map(product => (
                    <Item key={product.id}>
                        <Item.Image src={product.image} />

                        <Item.Content>
                            <Item.Header as='a'>{product.title}</Item.Header>
                            <Item.Meta>
                                <span className='cinema'>{product.category}</span>
                            </Item.Meta>
                            <Item.Description>{product.description}</Item.Description>
                            <Item.Extra>
                                <Button onClick={() => this.handleAddToCart(product.slug)} primary floated='right' icon labelPosition='right'>
                                    Add to cart
                                    <Icon name='cart plus' />
                                </Button>
                                {product.discount_price && (
                                    <Label 
                                        color={product.label === 'primary'? 'blue': product.label === 'secondary'? 'red': 'olive'}>
                                        {product.label}
                                    </Label>
                                )}
                            </Item.Extra>
                        </Item.Content>
                    </Item>
                ))}
                </Item.Group>
            </Container>
        );
    }
}

export default ProductList