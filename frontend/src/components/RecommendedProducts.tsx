import Image from 'next/image'

const dummy = [
    { name: 'iPhone 14', price: 1299, image: 'https://via.placeholder.com/100' },
    { name: 'Galaxy S23', price: 1199, image: 'https://via.placeholder.com/100' },
]

export default function RecommendedProducts() {
    return (
        <section className="py-10 px-6">
            <h2 className="text-2xl font-semibold mb-4">Recommended for You</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {dummy.map((item, i) => (
                    <div key={i} className="border p-4 rounded shadow-sm text-center">
                        <Image src={item.image} alt={item.name} width={100} height={100} className="mx-auto" />
                        <h3 className="mt-2 font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-600">₺{item.price}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}
