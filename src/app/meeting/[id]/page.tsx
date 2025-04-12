
"use client"
import dynamic from 'next/dynamic'

const Message = dynamic(
    () => import('./agora2/authenticationWorkflowManager'),
    {ssr: false})

const IndexPage = () => {
    return (
        <>
            <Message/>
        </>
    )
}

export default IndexPage

