import {useEffect, useReducer, useState} from "react";
import { useParams } from "react-router";
import {Button, Container, Image} from "react-bootstrap";
import PersonalData from "./PersonalData.jsx";
import stepIcon from "../../assets/icons/step.svg";
import currentStep from "../../assets/icons/currentStep.svg";
import registrationReducer, {initialState} from "../../utils/registrationReducer.js";
import ContactData from "./ContactData.jsx";
import LoginData from "./LoginData.jsx";
import Checkout from "../Checkout/Checkout.jsx";
import CashCheckout from "./CashCheckout.jsx";
import PaymentMethod from "./PaymentMethod.jsx";

function Register() {
    const params = useParams();
    const [step, setStep] = useState(0);
    const [state, dispatch] = useReducer(registrationReducer, initialState);
    const [uid, setUid] = useState("");

    useEffect(() => {
        dispatch({type: "UPDATE_DATA", payload: {["referredBy"]: params.referral}});
    }, [params.referral]);

    const nextStep = () => setStep((prev) => prev + 1);
    const prevStep = () => setStep((prev) => prev - 1);

    const saveUid = (uid) => {
        setUid(uid);
    }

    return (
        step === 3
            ? (<PaymentMethod step={step} nextStep={nextStep} uid={uid}/>)
            : (
                <Container fluid className="animated-bg">
                    <Container fluid className="d-flex justify-content-end">
                        <Button className="guideButton px-5 mt-4 mx-3 fw-bold">
                            Guida
                        </Button>
                    </Container>

                    {step === 0 && <PersonalData dispatch={dispatch} state={state} nextStep={nextStep}/>}
                    {step === 1 && <ContactData dispatch={dispatch} state={state} nextStep={nextStep} prevStep={prevStep}/>}
                    {step === 2 && <LoginData dispatch={dispatch} state={state} nextStep={nextStep} prevStep={prevStep} saveUid={saveUid}/>}
                    {step === 4 && <Checkout dispatch={dispatch} state={state} prevStep={prevStep}/> }


                    <Container fluid className="d-flex justify-content-center mt-3 py-5">
                        {step === 0 ? (<Image src={currentStep} className="mx-4" alt="Step" width={40} height={20}/>) : (<Image src={stepIcon} className="mx-4" alt="Step" width={40} height={20}/>)}
                        {step === 1 ? (<Image src={currentStep} className="mx-4" alt="Step" width={40} height={20}/>) : (<Image src={stepIcon} className="mx-4" alt="Step" width={40} height={20}/>)}
                        {step === 2 ? (<Image src={currentStep} className="mx-4" alt="Step" width={40} height={20}/>) : (<Image src={stepIcon} className="mx-4" alt="Step" width={40} height={20}/>)}
                        {step === 4 ? (<Image src={currentStep} className="mx-4" alt="Step" width={40} height={20}/>) : (<Image src={stepIcon} className="mx-4" alt="Step" width={40} height={20}/>)}
                    </Container>

                    <Container fluid className="d-flex justify-content-center">
                        <h5 className="text-light text-center">I dati personali contrassegnati con l'asterisco (*) sono obbligatori.</h5>
                    </Container>
                </Container>
            )
    );
}

export default Register;