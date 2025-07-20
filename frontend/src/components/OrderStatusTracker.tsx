type Props = {
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered'
}

const statusOrder = ['Pending', 'Processing', 'Shipped', 'Delivered']

const OrderStatusTracker = ({ status }: Props) => {
    const currentIndex = statusOrder.indexOf(status)

    return (
        <div className="flex items-center justify-between space-x-4">
            {statusOrder.map((step, index) => (
                <div key={step} className="flex-1 text-center">
                    <div
                        className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-white
              ${index <= currentIndex ? 'bg-green-500' : 'bg-gray-300'}
            `}
                    >
                        {index + 1}
                    </div>
                    <p className={`mt-1 text-sm ${index <= currentIndex ? 'text-green-600' : 'text-gray-500'}`}>
                        {step}
                    </p>
                </div>
            ))}
        </div>
    )
}

export default OrderStatusTracker
