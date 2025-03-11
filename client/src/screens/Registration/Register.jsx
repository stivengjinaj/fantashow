import {useEffect, useReducer, useState} from "react";
import { useParams } from "react-router";
import {Button, Container, Image} from "react-bootstrap";
import PersonalData from "./PersonalData.jsx";
import stepIcon from "../../assets/icons/step.svg";
import currentStep from "../../assets/icons/currentStep.svg";
import registrationReducer, {initialState} from "../../utils/registrationReducer.js";
import ContactData from "./ContactData.jsx";
import LoginData from "./LoginData.jsx";
import Payment from "./Payment.jsx";

function Register() {
    const params = useParams();
    const [referral, setReferral] = useState("");
    const [step, setStep] = useState(0);
    const [state, dispatch] = useReducer(registrationReducer, initialState);

    useEffect(() => {
        setReferral(params.referral);
    }, [params.referral]);

    const nextStep = () => setStep((prev) => prev + 1);
    const prevStep = () => setStep((prev) => prev - 1);

    return (
        <Container fluid className="animated-bg">
            <Container fluid className="d-flex justify-content-end">
                <Button className="guideButton px-5 mt-4 mx-3 fw-bold">
                    Guida
                </Button>
            </Container>

            {step === 0 && <PersonalData dispatch={dispatch} state={state} nextStep={nextStep}/>}
            {step === 1 && <ContactData dispatch={dispatch} state={state}/>}
            {step === 2 && <LoginData dispatch={dispatch} state={state}/>}
            {step === 3 && <Payment dispatch={dispatch} state={state}/>}


            <Container fluid className="d-flex justify-content-center mt-3 py-5">
                {step === 0 ? (<Image src={currentStep} className="mx-4" alt="Step" width={40} height={20}/>) : (<Image src={stepIcon} className="mx-4" alt="Step" width={40} height={20}/>)}
                {step === 1 ? (<Image src={currentStep} className="mx-4" alt="Step" width={40} height={20}/>) : (<Image src={stepIcon} className="mx-4" alt="Step" width={40} height={20}/>)}
                {step === 2 ? (<Image src={currentStep} className="mx-4" alt="Step" width={40} height={20}/>) : (<Image src={stepIcon} className="mx-4" alt="Step" width={40} height={20}/>)}
                {step === 3 ? (<Image src={currentStep} className="mx-4" alt="Step" width={40} height={20}/>) : (<Image src={stepIcon} className="mx-4" alt="Step" width={40} height={20}/>)}
            </Container>

            <Container fluid className="d-flex justify-content-center">
                <h5 className="text-light">I dati personali contrassegnati con l'asterisco (*) sono obbligatori.</h5>
            </Container>
        </Container>
    );
}

export default Register;