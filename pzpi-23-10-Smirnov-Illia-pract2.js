// MongoDB практичний приклад відповідно до теми "Архітектура програмних систем"
// Обрана система: база даних MongoDB (як приклад розподіленої системи з документною моделлю)

// Імпорт офіційного драйвера MongoDB
const { MongoClient, ObjectId } = require('mongodb');

// URI підключення (локальна БД як базовий варіант)
const uri = "mongodb://127.0.0.1:27017";

// Назва бази даних і колекції
const dbName = "architecture_pract2";
const collectionName = "systems";

// Головна асинхронна функція
async function main() {
    const client = new MongoClient(uri);

    try {
        // Підключення до MongoDB
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Очистка колекції для чистого запуску (логічне рішення для демонстрації)
        await collection.deleteMany({});

        // === CREATE (створення документів) ===
        const systems = [
            {
                name: "MongoDB",
                developer: "MongoDB Inc.",
                architectureStyle: "Document-oriented, distributed",
                components: {
                    storage: "WiredTiger",
                    replication: "Replica Sets",
                    scaling: "Sharding"
                },
                createdAt: new Date()
            },
            {
                name: "YouTube",
                developer: "Google",
                architectureStyle: "Microservices",
                components: {
                    frontend: "Web + Mobile",
                    backend: "Distributed services",
                    storage: "Distributed storage"
                },
                createdAt: new Date()
            }
        ];

        const insertResult = await collection.insertMany(systems);
        console.log("Додано документів:", insertResult.insertedCount);

        // === READ (читання даних) ===
        const allSystems = await collection.find({}).toArray();
        console.log("Усі системи:");
        console.log(allSystems);

        // Пошук однієї системи
        const mongoSystem = await collection.findOne({ name: "MongoDB" });
        console.log("Знайдена система MongoDB:");
        console.log(mongoSystem);

        // === UPDATE (оновлення даних) ===
        const updateResult = await collection.updateOne(
            { name: "MongoDB" },
            {
                $set: {
                    "components.cloud": "Atlas",
                    updatedAt: new Date()
                }
            }
        );
        console.log("Оновлено документів:", updateResult.modifiedCount);

        // === DELETE (видалення даних) ===
        const deleteResult = await collection.deleteOne({ name: "YouTube" });
        console.log("Видалено документів:", deleteResult.deletedCount);

        // === Агрегація (демонстрація архітектурних можливостей) ===
        const aggregation = await collection.aggregate([
            {
                $group: {
                    _id: "$architectureStyle",
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        console.log("Агрегація по архітектурному стилю:");
        console.log(aggregation);

        // === Індекси (для масштабованості та продуктивності) ===
        await collection.createIndex({ name: 1 }, { unique: true });
        console.log("Індекс створено");

        // === Приклад транзакції (для надійності, якщо використовується replica set) ===
        const session = client.startSession();

        try {
            session.startTransaction();

            await collection.insertOne(
                {
                    name: "AWS",
                    developer: "Amazon",
                    architectureStyle: "Cloud, distributed",
                    createdAt: new Date()
                },
                { session }
            );

            await collection.updateOne(
                { name: "MongoDB" },
                { $set: { verified: true } },
                { session }
            );

            await session.commitTransaction();
            console.log("Транзакція виконана успішно");
        } catch (error) {
            await session.abortTransaction();
            console.log("Транзакція скасована:", error.message);
        } finally {
            await session.endSession();
        }

    } catch (error) {
        console.error("Помилка:", error);
    } finally {
        // Закриття підключення
        await client.close();
    }
}

// Запуск програми
main();