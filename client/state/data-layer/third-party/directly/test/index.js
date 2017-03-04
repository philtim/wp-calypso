/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';
import * as directly from 'lib/directly';
import {
	DIRECTLY_ASK_QUESTION,
	DIRECTLY_INITIALIZATION_START,
	DIRECTLY_INITIALIZATION_SUCCESS,
	DIRECTLY_INITIALIZATION_ERROR,
} from 'state/action-types';
import {
	askQuestion,
	initialize,
} from '..';

describe( 'Directly data layer', () => {
	let next;
	let store;
	let simulateInitializationSuccess;
	let simulateInitializationError;

	useSandbox( ( sandbox ) => {
		next = sandbox.spy();
		store = {
			dispatch: sandbox.spy(),
		};
		// Stub in all lib/directly functions to avoid them being actually called
		sandbox.stub( directly, 'askQuestion' );
		sandbox.stub( directly, 'initialize' );
	} );

	beforeEach( () => {
		// Mock out a Promise that can be resolved or rejected in each tests to similate
		// Directly's library initializing or having an error
		directly.initialize.returns(
			new Promise( ( resolve, reject ) => {
				simulateInitializationSuccess = resolve;
				simulateInitializationError = reject;
			} )
		);
	} );

	describe( '#askQuestion', () => {
		const questionText = 'To be or not to be?';
		const name = 'Hamlet';
		const email = 'hammie@royalfamily.dk';
		const action = { type: DIRECTLY_ASK_QUESTION, questionText, name, email };

		it( 'should invoke the corresponding Directly function', () => {
			askQuestion( store, action, next );
			expect( directly.askQuestion ).to.have.been.calledWith( questionText, name, email );
		} );

		it( 'should pass the action through', () => {
			askQuestion( store, action, next );
			expect( next ).to.have.been.calledWith( action );
		} );
	} );

	describe( '#initialize', () => {
		const action = { type: DIRECTLY_INITIALIZATION_START };

		it( 'should invoke the corresponding Directly function', () => {
			initialize( store, action, next );
			expect( directly.initialize ).to.have.been.calledOnce;
		} );

		it( 'should pass the action through', () => {
			initialize( store, action, next );
			expect( next ).to.have.been.calledWith( action );
		} );

		it( 'should dispatch a success action if initialization completes', ( done ) => {
			initialize( store, action, next );

			directly.initialize().then( () => {
				expect( store.dispatch ).to.have.been.calledWith( { type: DIRECTLY_INITIALIZATION_SUCCESS } );
				done();
			} );

			simulateInitializationSuccess();
		} );

		it( 'should dispatch an error action if initialization fails', ( done ) => {
			initialize( store, action, next );

			directly.initialize().then(
				() => {},
				() => {
					expect( store.dispatch ).to.have.been.calledWith( { type: DIRECTLY_INITIALIZATION_ERROR } );
					done();
				}
			);

			simulateInitializationError();
		} );
	} );
} );
