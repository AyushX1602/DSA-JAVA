
#include <iostream>
#include <fstream>
#include <string>
#include <cstring>
#include <iomanip>

using namespace std;

// Define the record structure
struct Student {
    int rollNo;
    char name[50];
    float marks;
    bool isActive; // Flag to indicate if the record is active or deleted
};

class DirectAccessFile {
private:
    const string fileName;
    int recordSize;

public:
    DirectAccessFile(const string& file) : fileName(file) {
        recordSize = sizeof(Student);
    }

    /**
     * Create a file and pre-fill it with empty records.
     * This allows true direct access by roll number.
     */
    void createFile(int totalRecords = 100) {
        ofstream file(fileName, ios::out | ios::binary);
        if (!file) {
            cout << "Error creating file!" << endl;
            return;
        }

        Student empty = {0, "", 0.0f, false};
        for (int i = 0; i < totalRecords; ++i) {
            file.write(reinterpret_cast<char*>(&empty), recordSize);
        }

        file.close();
        cout << "File created and pre-filled with " << totalRecords << " empty records!" << endl;
    }

    void addRecord(const Student& student) {
        fstream file(fileName, ios::in | ios::out | ios::binary);
        if (!file) {
            cout << "Error opening file!" << endl;
            return;
        }

        int pos = (student.rollNo - 1) * recordSize;
        Student temp;

        file.seekg(pos);
        file.read(reinterpret_cast<char*>(&temp), recordSize);

        if (file && temp.isActive) {
            cout << "Record with Roll No. " << student.rollNo << " already exists!" << endl;
        } else {
            file.clear(); // clear EOF flag
            file.seekp(pos);
            file.write(reinterpret_cast<const char*>(&student), recordSize);
            cout << "Record added successfully!" << endl;
        }

        file.close();
    }

    void readRecord(int rollNo) {
        ifstream file(fileName, ios::in | ios::binary);
        if (!file) {
            cout << "Error opening file!" << endl;
            return;
        }

        int pos = (rollNo - 1) * recordSize;
        Student student;

        file.seekg(pos);
        file.read(reinterpret_cast<char*>(&student), recordSize);

        if (file && student.isActive) {
            cout << "\n----- Student Details -----" << endl;
            cout << "Roll No.: " << student.rollNo << endl;
            cout << "Name: " << student.name << endl;
            cout << "Marks: " << student.marks << endl;
        } else {
            cout << "Record with Roll No. " << rollNo << " not found!" << endl;
        }

        file.close();
    }

    void modifyRecord(int rollNo, const Student& newData) {
        fstream file(fileName, ios::in | ios::out | ios::binary);
        if (!file) {
            cout << "Error opening file!" << endl;
            return;
        }

        int pos = (rollNo - 1) * recordSize;
        Student student;

        file.seekg(pos);
        file.read(reinterpret_cast<char*>(&student), recordSize);

        if (file && student.isActive) {
            file.seekp(pos);
            Student updated = newData;
            updated.rollNo = rollNo;
            updated.isActive = true;

            file.write(reinterpret_cast<const char*>(&updated), recordSize);
            cout << "Record modified successfully!" << endl;
        } else {
            cout << "Record with Roll No. " << rollNo << " not found!" << endl;
        }

        file.close();
    }

    void deleteRecord(int rollNo) {
        fstream file(fileName, ios::in | ios::out | ios::binary);
        if (!file) {
            cout << "Error opening file!" << endl;
            return;
        }

        int pos = (rollNo - 1) * recordSize;
        Student student;

        file.seekg(pos);
        file.read(reinterpret_cast<char*>(&student), recordSize);

        if (file && student.isActive) {
            student.isActive = false;
            file.seekp(pos);
            file.write(reinterpret_cast<char*>(&student), recordSize);
            cout << "Record deleted successfully!" << endl;
        } else {
            cout << "Record with Roll No. " << rollNo << " not found!" << endl;
        }

        file.close();
    }

    void displayAllRecords() {
        ifstream file(fileName, ios::in | ios::binary);
        if (!file) {
            cout << "Error opening file!" << endl;
            return;
        }

        Student student;
        bool recordsExist = false;

        cout << "\n----- All Student Records -----" << endl;
        cout << left << setw(10) << "Roll No." << setw(30) << "Name" << setw(10) << "Marks" << endl;
        cout << string(50, '-') << endl;

        while (file.read(reinterpret_cast<char*>(&student), recordSize)) {
            if (student.isActive) {
                recordsExist = true;
                cout << left << setw(10) << student.rollNo
                     << setw(30) << student.name
                     << setw(10) << fixed << setprecision(2) << student.marks << endl;
            }
        }

        if (!recordsExist) {
            cout << "No active records found!" << endl;
        }

        file.close();
    }
};

int main() {
    DirectAccessFile file("students.dat");
    int choice, rollNo;
    Student student;

    file.createFile(); // Pre-fill with empty records

    while (true) {
        cout << "\n===== Direct Access File Operations =====" << endl;
        cout << "1. Add a Record" << endl;
        cout << "2. Read a Record" << endl;
        cout << "3. Modify a Record" << endl;
        cout << "4. Delete a Record" << endl;
        cout << "5. Display All Records" << endl;
        cout << "6. Exit" << endl;
        cout << "Enter your choice: ";
        cin >> choice;

        switch (choice) {
            case 1:
                cout << "\nEnter Roll No.: ";
                cin >> student.rollNo;

                cout << "Enter Name: ";
                cin.ignore();
                cin.getline(student.name, 50);

                cout << "Enter Marks: ";
                cin >> student.marks;

                student.isActive = true;
                file.addRecord(student);
                break;

            case 2:
                cout << "\nEnter Roll No. to read: ";
                cin >> rollNo;
                file.readRecord(rollNo);
                break;

            case 3:
                cout << "\nEnter Roll No. to modify: ";
                cin >> rollNo;

                cout << "Enter New Name: ";
                cin.ignore();
                cin.getline(student.name, 50);

                cout << "Enter New Marks: ";
                cin >> student.marks;

                student.isActive = true;
                file.modifyRecord(rollNo, student);
                break;

            case 4:
                cout << "\nEnter Roll No. to delete: ";
                cin >> rollNo;
                file.deleteRecord(rollNo);
                break;

            case 5:
                file.displayAllRecords();
                break;

            case 6:
                cout << "Exiting program. Goodbye!" << endl;
                return 0;

            default:
                cout << "Invalid choice! Please try again." << endl;
        }
    }

    return 0;
}
