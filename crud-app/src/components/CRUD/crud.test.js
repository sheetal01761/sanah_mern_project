// import Todo from './Crud'
import React from 'react'

import '@testing-library/jest-dom/extend-expect';
import {render,screen} from '@testing-library/react'
import { MemoryRouter, Route, Router } from 'react-router-dom';
import App from '../../App';

import { createMemoryHistory } from 'history';
import Crud from './Crud';

// it("When data is added",()=>{
//     const history = createMemoryHistory({ initialEntries: ['./Crud'] });
//     render(
//         <Router history={history} >
//             <Todo />
//         </Router>
//     )
//     console.log('SCREEN', screen)
//     // expect(history.location.pathname).toBe('/crud');
//     // const res = screen.getByTestId("text")
//     // console.log(res)
//     // expect(res).toBeInTheDocument()
// })


it("test input field",()=>{
    render(
        <MemoryRouter initialEntries={["/Crud"]}>
        <Crud />
      </MemoryRouter>
    )
    const inp = screen.getByPlaceholderText('✋ Write Studedhsnt First Name')
    console.log(inp)
    expect(inp).toBeInTheDocument()
})

// it("Second Input Testing",()=>{
//     render(<Router>
//         <Todo />
//     </Router>)
//     const inp2 = screen.getByPlaceholderText("✋ Write Student Mobile No.")
//     expect(inp2).toBeInTheDocument()
// })


// describe("test cases",()=>{
//     it("check email function",()=>{
//         render(<Todo />)
//         const fun1 = 
//         // let data = handle1()
//         console.log(fun1)
//     })
// })


describe('ButtonLogin', () => {
    test('should pass', () => {
    //   const history = createMemoryHistory({ initialEntries: ['/'] });
      const { getByText } = render(
        <MemoryRouter initialEntries={["/Crud"]}>
        <Crud />
      </MemoryRouter>
      );
    //   fireEvent.click(getByText('Iniciar sesión'));
    //   expect(history.location.pathname).toBe('/login');
    });
  });