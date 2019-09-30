import React, { useReducer, useEffect, useCallback } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';

// You typically define "useReducer" outside of your component so it isn't recreated every time the component renders/re-renders
const ingredientReducer = (currentIngredients, action) => {
	switch (action.type) {
		case 'SET':
			return action.ingredients;
		case 'ADD':
			return [...currentIngredients, action.ingredient];
		case 'DELETE':
			return currentIngredients.filter(ing => ing.id !== action.id);

		default:
			throw new Error('Should not get here!');
	}
};

const httpReducer = (httpState, action) => {
	switch (action.type) {
		case 'SEND':
			return { loading: true, error: null };
		case 'RESPONSE':
			return {
				...httpState,
				loading: false,
			};
		case 'ERROR':
			return {
				loading: false,
				error: action.errorMessage,
			};
		case 'CLEAR':
			return {
				...httpState,
				error: null,
			};
		default:
			throw new Error('Should not reach here!');
	}
};

const Ingredients = () => {
	const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
	const [httpState, dispatchHttp] = useReducer(httpReducer, { loading: false, error: null });
	// const [userIngredients, setUserIngredients] = useState([]);
	// const [isLoading, setIsLoading] = useState(false);
	// const [error, setError] = useState();

	useEffect(() => {
		console.log('RENDERING USE STATE', userIngredients);
	}, [userIngredients]);

	const filteredIngredientsHandler = useCallback(filteredIngredients => {
		// setUserIngredients(filteredIngredients);
		dispatch({ type: 'SET', ingredients: filteredIngredients });
	}, []);

	const addIngredientHandler = ingredient => {
		dispatchHttp({ type: 'SEND' });
		fetch('https://react-hooks-2acaa.firebaseio.com/ingredients.json', {
			method: 'POST',
			body: JSON.stringify(ingredient),
			headers: { 'Content-Type': 'application/json' },
		})
			.then(response => {
				dispatchHttp({ type: 'RESPONSE' });
				return response.json();
			})
			.then(responseData => {
				// setUserIngredients(prevIngredients => [...prevIngredients, { id: responseData.name, ...ingredient }]);
				dispatch({ type: 'ADD', ingredient: { id: responseData.name, ...ingredient } });
			});
	};

	const onRemoveItem = id => {
		dispatchHttp({ type: 'SEND' });
		fetch(`https://react-hooks-2acaa.firebaseio.com/ingredients/${id}.json`, {
			method: 'DELETE',
		})
			.then(res => {
				dispatchHttp({ type: 'RESPONSE' });
				// setUserIngredients(prevIngredients => {
				// 	return prevIngredients.filter(el => el.id !== id);
				// });
				dispatch({ type: 'DELETE', id: id });
			})
			.catch(err => {
				dispatchHttp({ type: 'ERROR', errorMessage: err.message });
			});
	};

	const clearError = () => {
		dispatchHttp({ type: 'CLEAR' });
	};

	return (
		<div className="App">
			{httpState.error && <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>}
			<IngredientForm onAddIngredient={addIngredientHandler} loading={httpState.loading} />

			<section>
				<Search onLoadIngredients={filteredIngredientsHandler} />
				<IngredientList ingredients={userIngredients} onRemoveItem={onRemoveItem} />
			</section>
		</div>
	);
};

export default Ingredients;
