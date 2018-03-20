import React from 'react'
import { graphql } from 'react-apollo'
import {createFilter} from 'react-search-input'
import { Grid, Checkbox } from 'semantic-ui-react'
import { getCategorybySocialIdQuery } from './graphql/categoryQueries'
import Loader from '../Loader'

const KEYS_TO_FILTERS = ['name']

const CategoriesList = ({socialProfile, searchTerm, onCategorySelected, selectedCategoryIds}) => {
  const fetchedArray = !socialProfile ? [] : socialProfile.categories
  if (fetchedArray.length === 0) {
    return <Loader />
  }

  const availableCategories = fetchedArray.edges.map((e) => ({...e.node}))
  
  const filteredCategory = availableCategories.filter(createFilter(searchTerm, KEYS_TO_FILTERS))

  return (<Grid className='category-filter'>
    <Grid.Row columns={2}>
      {filteredCategory.map((category, index) => {
        const catInfo = {
          name: category.name,
          id: category.id,
          selected: selectedCategoryIds.indexOf(category.id) !== -1 ? true : false
        }

        return (
        <Grid.Column width={4} key={catInfo.id}>
          <Checkbox
            label={catInfo.name}
            value={catInfo.id}
            defaultChecked={catInfo.selected}
            onClick={onCategorySelected}
          />
        </Grid.Column >)
      })}
    </Grid.Row>
  </Grid>)
}

export default graphql(getCategorybySocialIdQuery, {
  options: (ownProps) => ({
    variables: {
      id: ownProps.socialId
    }
  }),
  props: ({data: { socialProfile }}) => ({ socialProfile })
})(CategoriesList)
